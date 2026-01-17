package com.naplistener.notification

import android.content.ComponentName
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import com.naplistener.bridge.NotificationEventEmitter
import com.naplistener.db.NotificationEntity
import com.naplistener.user.UserStore
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class NapNotificationListener : NotificationListenerService() {

    override fun onListenerConnected() {
        super.onListenerConnected()
        Log.d("NapListener", "NotificationListener CONNECTED")
        NotificationEventEmitter.notifyStatus("CONNECTED")
    }

    override fun onListenerDisconnected() {
        super.onListenerDisconnected()
        Log.e("NapListener", "NotificationListener DISCONNECTED")
        requestRebind(ComponentName(this, NapNotificationListener::class.java))
        NotificationEventEmitter.notifyStatus("DISCONNECTED")
    }

    override fun onNotificationPosted(sbn: StatusBarNotification) {

        val title = sbn.notification.extras.getString("android.title")

        if (title == "Nap Listener Health") {
            ListenerProbeState.received = true
            return
        }

        if (!AllowedAppsStore.isAllowed(applicationContext, sbn.packageName)) {
            return
        }

        try {
            val notification = sbn.notification
            val extras = notification.extras

            val title = NotificationTextExtractor.extractTitle(extras)
            val text = NotificationTextExtractor.extractText(extras)

            if (title.isNullOrBlank() && text.isNullOrBlank()) return

            val userName = UserStore.getName(applicationContext)

            val entity =
                    NotificationEntity(
                            packageName = sbn.packageName,
                            title = title,
                            text = text,
                            timestamp = System.currentTimeMillis(),
                            eventType = "POSTED",
                            userName = userName
                    )

            CoroutineScope(Dispatchers.IO).launch {
                try {
                    NotificationRepository.save(applicationContext, entity)
                    NotificationEventEmitter.notifyChanged()
                } catch (e: Exception) {
                    Log.e("NapListener", "Error onNotificationPosted Interno", e)
                    e.printStackTrace()
                }
            }
        } catch (e: Exception) {
            Log.e("NapListener", "Error onNotificationPosted", e)
        }
    }

    // override fun onNotificationRemoved(sbn: StatusBarNotification) {
    //     val entity =
    //             NotificationEntity(
    //                     packageName = sbn.packageName,
    //                     title = null,
    //                     text = null,
    //                     timestamp = System.currentTimeMillis(),
    //                     eventType = "REMOVED"
    //             )

    //     CoroutineScope(Dispatchers.IO).launch {
    //         try {
    //             NotificationRepository.save(applicationContext, entity)
    //             NotificationEventEmitter.notifyChanged()
    //         } catch (e: Exception) {
    //             e.printStackTrace()
    //         }
    //     }
    // }
}
