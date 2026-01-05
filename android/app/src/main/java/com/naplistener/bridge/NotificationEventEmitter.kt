package com.naplistener.bridge

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.modules.core.DeviceEventManagerModule

object NotificationEventEmitter {

  private var reactContext: ReactApplicationContext? = null

  fun init(context: ReactApplicationContext) {
    reactContext = context
  }

  fun notifyChanged() {
    val context =
            reactContext
                    ?: run {
                      return
                    }

    context.getJSModule(
                    com.facebook.react.modules.core.DeviceEventManagerModule
                                    .RCTDeviceEventEmitter::class
                            .java
            )
            .emit("notifications_changed", null)
  }

  fun notifyStatus(status: String) {
    reactContext
            ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            ?.emit("listenerStatus", status)
  }
}
