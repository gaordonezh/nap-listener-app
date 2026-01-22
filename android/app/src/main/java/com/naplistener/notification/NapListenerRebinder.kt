package com.naplistener.notification

import android.content.ComponentName
import android.content.Context
import android.service.notification.NotificationListenerService
import android.util.Log

object NapListenerRebinder {

  fun rebind(context: Context) {

    try {
      val component = ComponentName(context, NapNotificationListener::class.java)
      NotificationListenerService.requestRebind(component)
      Log.d("NapListener", "request rebind ejecutado")

      // Handler(Looper.getMainLooper())
      //         .postDelayed(
      //                 {
      //                   try {
      //                     requestRebind(component)
      //                     Log.d("NapListener", "requestRebind executed")
      //                   } catch (e: Exception) {
      //                     Log.e("NapListener", "Rebind failed", e)
      //                   }
      //                 },
      //                 3000
      //         )
    } catch (e: Exception) {
      Log.e("NapListener", "request rebind falló", e)
    }
  }
}
