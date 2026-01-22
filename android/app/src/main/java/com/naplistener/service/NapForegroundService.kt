package com.naplistener.service

import android.app.*
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat

class NapForegroundService : Service() {

  private val NOTIFICATION_ID = 101
  private val CHANNEL_ID = "nap_listener_channel"

  override fun onCreate() {
    super.onCreate()
    Log.d("NapFGS", "🔥 NapForegroundService onCreate")

    createNotificationChannel()
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {

    Log.d("NapFGS", "onStartCommand")

    val notification =
            NotificationCompat.Builder(this, CHANNEL_ID)
                    .setSmallIcon(android.R.drawable.stat_notify_more)
                    .setContentTitle("Nap Listener activo")
                    .setContentText("Escuchando notificaciones en segundo plano")
                    .setOngoing(true)
                    .setCategory(NotificationCompat.CATEGORY_SERVICE)
                    .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
                    .build()

    startForeground(NOTIFICATION_ID, notification)

    return START_STICKY
  }

  private fun createNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val manager = getSystemService(NotificationManager::class.java)

      val existing = manager.getNotificationChannel(CHANNEL_ID)

      if (existing != null && existing.importance == NotificationManager.IMPORTANCE_NONE) {
        manager.deleteNotificationChannel(CHANNEL_ID)
      }

      val channel =
              NotificationChannel(
                              CHANNEL_ID,
                              "Nap Listener Background",
                              NotificationManager.IMPORTANCE_LOW
                      )
                      .apply {
                        description = "Mantiene activo el listener de notificaciones"
                        setShowBadge(false)
                      }

      manager.createNotificationChannel(channel)
    }
  }

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onDestroy() {
    Log.d("NapFGS", "🛑 NapForegroundService destroyed")
    super.onDestroy()
    stopForeground(true)
  }
}
