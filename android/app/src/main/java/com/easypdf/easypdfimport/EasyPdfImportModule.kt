package com.easypdf.easypdfimport

import android.content.ContentResolver
import android.net.Uri
import android.provider.OpenableColumns
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.WritableMap
import java.io.File
import java.io.FileOutputStream
import java.security.MessageDigest

class EasyPdfImportModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "EasyPdfImportModule"

    @com.facebook.react.bridge.ReactMethod
    fun importIncomingPdf(uriString: String, promise: Promise) {
        try {
            val uri = Uri.parse(uriString)
            if (uri.scheme.isNullOrBlank()) {
                promise.reject("INVALID_URI", "Missing URI scheme")
                return
            }

            val resolver = reactContext.contentResolver
            val displayName = resolveDisplayName(resolver, uri)
            val libraryDir = ensureLibraryDir()
            val tempFile = File.createTempFile("easypdf_", ".pdf", reactContext.cacheDir)

            val hash = copyUriToTempAndHash(resolver, uri, tempFile)
            val existing = findExistingByHash(libraryDir, hash)

            if (existing != null) {
                tempFile.delete()
                promise.resolve(buildResult(existing, duplicate = true))
                return
            }

            val target = uniqueDestination(libraryDir, displayName)
            tempFile.copyTo(target, overwrite = true)
            tempFile.delete()

            promise.resolve(buildResult(target, duplicate = false))
        } catch (e: Exception) {
            promise.reject("IMPORT_FAILED", e)
        }
    }

    private fun ensureLibraryDir(): File {
        val base = reactContext.getExternalFilesDir(null) ?: reactContext.filesDir
        val dir = File(base, "EasyPDF")
        if (!dir.exists()) dir.mkdirs()
        return dir
    }

    private fun resolveDisplayName(resolver: ContentResolver, uri: Uri): String {
        resolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)?.use { cursor ->
            val index = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
            if (index >= 0 && cursor.moveToFirst()) {
                val name = cursor.getString(index)
                if (!name.isNullOrBlank()) return name
            }
        }

        return uri.lastPathSegment?.substringAfterLast('/')?.takeIf { it.isNotBlank() } ?: "PDF.pdf"
    }

    private fun copyUriToTempAndHash(
        resolver: ContentResolver,
        uri: Uri,
        tempFile: File
    ): String {
        val digest = MessageDigest.getInstance("SHA-256")

        resolver.openInputStream(uri)?.use { input ->
            FileOutputStream(tempFile).use { output ->
                val buffer = ByteArray(8192)
                while (true) {
                    val read = input.read(buffer)
                    if (read <= 0) break
                    output.write(buffer, 0, read)
                    digest.update(buffer, 0, read)
                }
                output.flush()
            }
        } ?: throw IllegalStateException("Unable to open input stream")

        return digest.digest().joinToString("") { "%02x".format(it) }
    }

    private fun hashFile(file: File): String {
        val digest = MessageDigest.getInstance("SHA-256")

        file.inputStream().use { input ->
            val buffer = ByteArray(8192)
            while (true) {
                val read = input.read(buffer)
                if (read <= 0) break
                digest.update(buffer, 0, read)
            }
        }

        return digest.digest().joinToString("") { "%02x".format(it) }
    }

    private fun findExistingByHash(libraryDir: File, hash: String): File? {
        libraryDir.listFiles()?.forEach { file ->
            if (file.isFile && file.name.endsWith(".pdf", ignoreCase = true)) {
                try {
                    if (hashFile(file) == hash) return file
                } catch (_: Exception) {
                }
            }
        }
        return null
    }

    private fun sanitizeName(name: String): String {
        val cleaned = name
            .replace(Regex("\\.pdf$", RegexOption.IGNORE_CASE), "")
            .replace(Regex("""[\\/:*?"<>|]"""), "")
            .trim()

        return if (cleaned.isBlank()) "PDF" else cleaned
    }

    private fun uniqueDestination(libraryDir: File, displayName: String): File {
        val safeBase = sanitizeName(displayName)

        var candidate = File(libraryDir, "$safeBase.pdf")
        if (!candidate.exists()) return candidate

        var index = 1
        while (true) {
            candidate = File(libraryDir, "$safeBase ($index).pdf")
            if (!candidate.exists()) return candidate
            index++
        }
    }

    private fun buildResult(file: File, duplicate: Boolean): WritableMap {
        val map = Arguments.createMap()
        map.putString("id", file.absolutePath)
        map.putString("path", file.absolutePath)
        map.putString("uri", "file://${file.absolutePath}")
        map.putString("fileName", file.name)
        map.putString("displayName", displayNameFromFileName(file.name))
        map.putBoolean("duplicate", duplicate)
        map.putDouble("modifiedAt", file.lastModified().toDouble())
        map.putDouble("size", file.length().toDouble())
        return map
    }

    private fun displayNameFromFileName(fileName: String): String {
        val base = fileName
            .replace(Regex("\\.pdf$", RegexOption.IGNORE_CASE), "")
            .trim()

        return if (base.isBlank()) "PDF" else base
    }
}