package com.naplistener.notification

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST

interface ApiService {

    // @POST("events") fun sendNotifications(@Body notifications: List<NotificationDto>): Call<Unit>

    @POST("events") suspend fun sendNotifications(@Body notifications: List<NotificationDto>)
}

object ApiClient {
    private val retrofit =
            Retrofit.Builder()
                    .baseUrl("http://192.168.1.202:5001/")
                    .addConverterFactory(GsonConverterFactory.create())
                    .build()

    val service: ApiService = retrofit.create(ApiService::class.java)
}
