package com.netappperu.naplistener.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.IBinder
import androidx.core.app.NotificationCompat
import kotlin.random.Random
import com.netappperu.naplistener.R

class ProbeService : Service() {

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {

    val manager = getSystemService(NotificationManager::class.java)

    val channelId = "nap_probe"

    val serviceName = "Napcheck Health"

    val channel = NotificationChannel(channelId, serviceName, NotificationManager.IMPORTANCE_LOW)
    manager.createNotificationChannel(channel)

    val notification: Notification =
            NotificationCompat.Builder(this, channelId)
                    .setSmallIcon(R.drawable.ic_notification)
                    .setContentTitle(serviceName)
                    .setContentText("Verificación de escucha de notificaciones de Napcheck")
                    .build()

    manager.notify(Random.nextInt(), notification)

    stopSelf()
    return START_NOT_STICKY
  }

  override fun onBind(intent: Intent?): IBinder? = null
}
