package com.easypdf.pdfthumbnail // Match your package structure

import android.graphics.Bitmap
import android.graphics.Color
import android.graphics.pdf.PdfRenderer
import android.os.ParcelFileDescriptor
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File
import java.io.FileOutputStream

class PdfThumbnailModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "PdfThumbnailMaker"
    }

    @ReactMethod
    fun generateThumbnail(pdfPath: String, promise: Promise) {
        try {
            // 1. Clean the path and verify file exists
            val cleanPath = pdfPath.replace("file://", "")
            val file = File(cleanPath)

            if (!file.exists()) {
                promise.reject("FILE_NOT_FOUND", "PDF file does not exist at path: $cleanPath")
                return
            }

            // 2. Open the built-in Android PDF Renderer
            val fd = ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY)
            val renderer = PdfRenderer(fd)
            val page = renderer.openPage(0) // Page 1

            // 3. Create a scaled-down Bitmap for high performance
            val width = 800
            val height = (width.toFloat() / page.width * page.height).toInt()
            val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)

            // Fill background with white (PDFs are naturally transparent)
            bitmap.eraseColor(Color.WHITE)

            // Render PDF onto Bitmap
            page.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)

            // 4. Create a dedicated Thumbnails directory inside the app's secure filesDir
            val thumbDir = File(reactApplicationContext.filesDir, "PdfThumbnails")
            if (!thumbDir.exists()) {
                thumbDir.mkdirs()
            }

            // 5. Save the thumbnail with the EXACT same name as the PDF (but .jpg)
            val thumbFile = File(thumbDir, "${file.nameWithoutExtension}.jpg")
            val outStream = FileOutputStream(thumbFile)
            
            bitmap.compress(Bitmap.CompressFormat.JPEG, 80, outStream)
            outStream.flush()
            outStream.close()

            // 6. Clean up native memory immediately to prevent leaks
            page.close()
            renderer.close()
            fd.close()

            // 7. Return the new JPG path to React Native
            promise.resolve("file://${thumbFile.absolutePath}")

        } catch (e: Exception) {
            promise.reject("THUMBNAIL_ERROR", e.message)
        }
    }
}