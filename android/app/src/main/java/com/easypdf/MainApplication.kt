package com.easypdf

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.easypdf.easypdfimport.EasyPdfImportPackage
import com.easypdf.pdfthumbnail.PdfThumbnailPackage

class MainApplication : Application(), ReactApplication {

    override val reactHost: ReactHost by lazy {
        getDefaultReactHost(
            context = applicationContext,
            packageList = PackageList(this).packages.apply {
                add(EasyPdfImportPackage())
                add(PdfThumbnailPackage())
            },
        )
    }

    override fun onCreate() {
        super.onCreate()
        loadReactNative(this)
    }
}