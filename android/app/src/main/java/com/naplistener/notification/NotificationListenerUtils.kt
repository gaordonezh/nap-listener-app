package com.naplistener.notification

import android.content.Context
import android.provider.Settings

object NotificationListenerUtils {

    fun isEnabled(context: Context): Boolean {
        val enabled =
                Settings.Secure.getString(context.contentResolver, "enabled_notification_listeners")
                        ?: return false

        return enabled.contains(context.packageName)
    }
}
