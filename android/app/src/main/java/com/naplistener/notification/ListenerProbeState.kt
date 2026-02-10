package com.netappperu.naplistener.notification

object ListenerProbeState {
    @Volatile var connected: Boolean = false
    @Volatile var received: Boolean = false
}
