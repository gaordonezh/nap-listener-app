package com.naplistener.probe

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.IBinder
import androidx.core.app.NotificationCompat
import kotlin.random.Random

class ProbeService : Service() {

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {

        val manager = getSystemService(NotificationManager::class.java)

        val channelId = "nap_probe"

        val channel =
                NotificationChannel(channelId, "NAP Probe", NotificationManager.IMPORTANCE_LOW)
        manager.createNotificationChannel(channel)

        val notification: Notification =
                NotificationCompat.Builder(this, channelId)
                        .setSmallIcon(android.R.drawable.stat_notify_more)
                        .setContentTitle("Nap Listener Health")
                        .setContentText(
                                "Verificación de escucha de notificaciones de Nap Listener correcta."
                        )
                        .build()

        manager.notify(Random.nextInt(), notification)

        stopSelf()
        return START_NOT_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
