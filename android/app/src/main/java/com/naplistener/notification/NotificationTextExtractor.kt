package com.netappperu.naplistener.notification

import android.app.Notification
import android.os.Bundle

object NotificationTextExtractor {

        fun extractTitle(extras: Bundle): String? {
                return when {
                        extras.getCharSequence(Notification.EXTRA_TITLE) != null ->
                                extras.getCharSequence(Notification.EXTRA_TITLE).toString()
                        extras.getCharSequence(Notification.EXTRA_TITLE_BIG) != null ->
                                extras.getCharSequence(Notification.EXTRA_TITLE_BIG).toString()
                        extras.getCharSequence(Notification.EXTRA_CONVERSATION_TITLE) != null ->
                                extras.getCharSequence(Notification.EXTRA_CONVERSATION_TITLE)
                                        .toString()
                        else -> null
                }
        }

        fun extractText(extras: Bundle): String? {
                return when {
                        extras.getCharSequence(Notification.EXTRA_TEXT) != null ->
                                extras.getCharSequence(Notification.EXTRA_TEXT).toString()
                        extras.getCharSequence(Notification.EXTRA_BIG_TEXT) != null ->
                                extras.getCharSequence(Notification.EXTRA_BIG_TEXT).toString()
                        extras.getCharSequence(Notification.EXTRA_SUMMARY_TEXT) != null ->
                                extras.getCharSequence(Notification.EXTRA_SUMMARY_TEXT).toString()
                        extras.getCharSequence(Notification.EXTRA_SUB_TEXT) != null ->
                                extras.getCharSequence(Notification.EXTRA_SUB_TEXT).toString()
                        else -> null
                }
        }
}
