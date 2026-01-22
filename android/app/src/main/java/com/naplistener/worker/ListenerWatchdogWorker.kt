package com.naplistener.worker

import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.naplistener.notification.ListenerProbeState
import com.naplistener.service.NapForegroundService

class ListenerWatchdogWorker(context: Context, params: WorkerParameters) :
        CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {

        if (!ListenerProbeState.connected) {
            Log.w("NapListener", "Watchdog detectó listener caído")

            val intent = Intent(applicationContext, NapForegroundService::class.java)

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                applicationContext.startForegroundService(intent)
            } else {
                applicationContext.startService(intent)
            }
        }

        return Result.success()
    }
}
