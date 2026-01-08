package com.naplistener.notification

import com.naplistener.BuildConfig
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST

interface ApiService {

    @POST("/events") suspend fun sendNotifications(@Body notifications: List<NotificationDto>)
}

object ApiClient {
    private val retrofit =
            Retrofit.Builder()
                    .baseUrl(BuildConfig.API_BASE_URL)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build()

    val service: ApiService = retrofit.create(ApiService::class.java)
}
