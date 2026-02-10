package com.netappperu.naplistener.user

import android.content.Context

object UserStore {

    private const val PREFS = "naplistener_user"
    private const val KEY_NAME = "user_name"

    fun saveName(context: Context, name: String) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                .edit()
                .putString(KEY_NAME, name)
                .apply()
    }

    fun getName(context: Context): String? {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY_NAME, null)
    }
}
