package com.easypdf

import android.app.Activity
import android.graphics.Color
import android.os.Build
import android.view.View
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.UiThreadUtil

class NavigationBarColorModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "NavigationBarColor"
    }

    @ReactMethod
    fun changeColor(hexColor: String, lightIcons: Boolean) {
        // FIX: Explicitly calling the Java method bypasses the Kotlin unresolved reference error
        val activity: Activity? = getCurrentActivity() 
        
        if (activity == null) return

        UiThreadUtil.runOnUiThread {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                val window = activity.window
                window.navigationBarColor = Color.parseColor(hexColor)

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    val decorView = window.decorView
                    var flags = decorView.systemUiVisibility
                    flags = if (lightIcons) {
                        flags and View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR.inv()
                    } else {
                        flags or View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
                    }
                    decorView.systemUiVisibility = flags
                }
            }
        }
    }
}