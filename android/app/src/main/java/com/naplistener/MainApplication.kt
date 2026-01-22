package com.naplistener

import android.app.Application
import android.content.Context
import androidx.work.*
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.naplistener.bridge.NotificationPackage
import com.naplistener.worker.ListenerWatchdogWorker
import com.naplistener.worker.NotificationCleanupWorker
import com.naplistener.worker.NotificationSyncWorker
import java.util.concurrent.TimeUnit

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
            context = applicationContext,
            packageList = PackageList(this).packages.apply { add(NotificationPackage()) }
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)

    scheduleCleanupWorker(this)
    scheduleSyncWorker(this)
    NotificationSyncWorker.enqueue(this)
    startListenerWatchdog(this)
  }

  private fun scheduleCleanupWorker(context: Context) {
    val workRequest =
            PeriodicWorkRequestBuilder<NotificationCleanupWorker>(1, TimeUnit.HOURS).build()

    WorkManager.getInstance(context)
            .enqueueUniquePeriodicWork(
                    "nap_notification_cleanup",
                    ExistingPeriodicWorkPolicy.KEEP,
                    workRequest
            )
  }

  private fun scheduleSyncWorker(context: Context) {
    val request =
            PeriodicWorkRequestBuilder<NotificationSyncWorker>(30, TimeUnit.MINUTES)
                    .setConstraints(
                            Constraints.Builder()
                                    .setRequiredNetworkType(NetworkType.CONNECTED)
                                    .build()
                    )
                    .build()

    WorkManager.getInstance(context)
            .enqueueUniquePeriodicWork(
                    "nap_notification_sync",
                    ExistingPeriodicWorkPolicy.KEEP,
                    request
            )
  }

  private fun startListenerWatchdog(context: Context) {

    val work = PeriodicWorkRequestBuilder<ListenerWatchdogWorker>(15, TimeUnit.MINUTES).build()

    WorkManager.getInstance(context)
            .enqueueUniquePeriodicWork(
                    "nap_listener_watchdog",
                    ExistingPeriodicWorkPolicy.KEEP,
                    work
            )
  }
}
