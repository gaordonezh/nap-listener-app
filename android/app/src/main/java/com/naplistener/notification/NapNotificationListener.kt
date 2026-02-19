package com.netappperu.naplistener.notification

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import com.netappperu.naplistener.bridge.NotificationEventEmitter
import com.netappperu.naplistener.db.NotificationEntity
import com.netappperu.naplistener.user.UserStore
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class NapNotificationListener : NotificationListenerService() {

    override fun onListenerConnected() {
        super.onListenerConnected()
        ListenerProbeState.connected = true
        NotificationEventEmitter.notifyStatus("CONNECTED")
    }

    override fun onListenerDisconnected() {
        super.onListenerDisconnected()
        ListenerProbeState.connected = false
        NotificationEventEmitter.notifyStatus("DISCONNECTED")
        NapListenerRebinder.rebind(this)
    }

    override fun onNotificationPosted(sbn: StatusBarNotification) {

        val titleInit = sbn.notification.extras.getString("android.title")

        if (titleInit == "Nap Listener Health") {
            ListenerProbeState.received = true
            return
        }

        val isAllowedApp = AllowedAppsStore.isAllowed(applicationContext, sbn.packageName)

        if (!isAllowedApp) {
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
                    NotificationRepository.saveAndSend(applicationContext, entity)
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
