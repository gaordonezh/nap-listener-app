package com.naplistener.notification

import android.content.ComponentName
import android.content.Context
import android.service.notification.NotificationListenerService
import android.util.Log

object NapListenerRebinder {

    fun rebind(context: Context) {
        val component = ComponentName(context, NapNotificationListener::class.java)

        try {
            NotificationListenerService.requestRebind(component)
            Log.d("NapListener", "request rebind ejecutado")
        } catch (e: Exception) {
            Log.e("NapListener", "request rebind falló", e)
        }
    }
}
