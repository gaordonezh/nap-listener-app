package com.naplistener.bridge

import android.content.ComponentName
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import com.facebook.react.bridge.*
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactMethod
import com.naplistener.BuildConfig
import com.naplistener.db.AppDatabase
import com.naplistener.notification.AllowedAppsStore
import com.naplistener.notification.ListenerProbeState
import com.naplistener.notification.NapListenerRebinder
import com.naplistener.service.ProbeService
import com.naplistener.user.UserStore
import com.naplistener.worker.NotificationSyncWorker
import com.naplistener.worker.WorkStatusUtils

class NotificationModule(private val reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext) {

  init {
    NotificationEventEmitter.init(reactContext)
  }

  override fun getName(): String = "NotificationModule"

  @ReactMethod
  fun openNotificationSettings() {
    val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    reactContext.startActivity(intent)
  }

  @ReactMethod
  fun getNotifications(limit: Int, offset: Int, promise: Promise) {
    try {
      val dao = AppDatabase.get(reactContext).notificationDao()
      val list = dao.getPaged(limit, offset)

      val array = Arguments.createArray()

      list.forEach { n ->
        val map = Arguments.createMap()
        map.putDouble("id", n.id.toDouble())
        map.putString("packageName", n.packageName)
        map.putString("title", n.title)
        map.putString("text", n.text)
        map.putDouble("timestamp", n.timestamp.toDouble())
        map.putString("eventType", n.eventType)
        array.pushMap(map)
      }

      promise.resolve(array)
    } catch (e: Exception) {
      promise.reject("GET_NOTIFICATIONS_ERROR", e)
    }
  }

  @ReactMethod
  fun hasNotificationPermission(promise: Promise) {
    try {
      val enabledListeners =
              Settings.Secure.getString(
                      reactContext.contentResolver,
                      "enabled_notification_listeners"
              )

      val myComponent =
              ComponentName(reactContext, "com.naplistener.notification.NapNotificationListener")

      val granted = enabledListeners?.contains(myComponent.flattenToString()) ?: false

      promise.resolve(granted)
    } catch (e: Exception) {
      promise.reject("PERMISSION_CHECK_ERROR", e)
    }
  }

  @ReactMethod
  fun setAllowedPackages(packages: ReadableArray) {
    val set = mutableSetOf<String>()

    for (i in 0 until packages.size()) {
      val pkg = packages.getString(i)
      if (!pkg.isNullOrBlank()) {
        set.add(pkg)
      }
    }

    AllowedAppsStore.setAllowed(reactContext, set)
  }

  @ReactMethod
  fun getAllowedPackages(promise: Promise) {
    try {
      val list = AllowedAppsStore.getAllowed(reactContext).toList()
      val array = Arguments.createArray()
      list.forEach { array.pushString(it) }
      promise.resolve(array)
    } catch (e: Exception) {
      promise.reject("GET_ALLOWED_ERROR", e)
    }
  }

  @ReactMethod
  fun syncNow(promise: Promise) {
    try {
      NotificationSyncWorker.enqueueManual(reactContext)
      NotificationSyncWorker.enqueue(reactContext)
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("SYNC_ERROR", e)
    }
  }

  @ReactMethod
  fun isSyncActive(promise: Promise) {
    try {
      val active = WorkStatusUtils.isSyncScheduled(reactContext)
      promise.resolve(active)
    } catch (e: Exception) {
      promise.reject("SYNC_STATUS_ERROR", e)
    }
  }

  @ReactMethod
  fun saveUserName(name: String, promise: Promise) {
    UserStore.saveName(reactContext, name)
    promise.resolve(true)
  }

  @ReactMethod
  fun getUserName(promise: Promise) {
    promise.resolve(UserStore.getName(reactContext))
  }

  @ReactMethod
  fun getApiBaseUrl(promise: Promise) {
    promise.resolve(BuildConfig.API_BASE_URL)
  }

  @ReactMethod
  fun verifyListener(promise: Promise) {
    ListenerProbeState.received = false

    val intent = Intent(reactContext, ProbeService::class.java)
    reactContext.startService(intent)

    Handler(Looper.getMainLooper())
            .postDelayed(
                    {
                      val alive = ListenerProbeState.received

                      if (!alive) {
                        NapListenerRebinder.rebind(reactContext)
                      }

                      promise.resolve(alive)
                    },
                    3000
            )
  }
}
