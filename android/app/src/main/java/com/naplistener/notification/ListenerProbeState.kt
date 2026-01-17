package com.naplistener.notification

object ListenerProbeState {
    @Volatile var lastProbeId: String? = null

    @Volatile var received: Boolean = false
}
