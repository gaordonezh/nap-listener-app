package com.netappperu.naplistener.notification

import android.content.Context

object AllowedAppsStore {

    private const val PREFS_NAME = "naplistener_allowed_apps"
    private const val KEY_PACKAGES = "packages"

    fun getAllowed(context: Context): Set<String> {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getStringSet(KEY_PACKAGES, emptySet()) ?: emptySet()
    }

    fun setAllowed(context: Context, packages: Set<String>) {
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .edit()
                .putStringSet(KEY_PACKAGES, packages)
                .apply()
    }

    fun isAllowed(context: Context, packageName: String): Boolean {
        val allowed = getAllowed(context)
        return allowed.isEmpty() || allowed.contains(packageName)
    }
}
