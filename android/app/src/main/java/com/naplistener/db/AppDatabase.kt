package com.naplistener.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(entities = [NotificationEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {

    abstract fun notificationDao(): NotificationDao

    companion object {
        @Volatile private var INSTANCE: AppDatabase? = null

        fun get(context: Context): AppDatabase =
                INSTANCE
                        ?: synchronized(this) {
                            INSTANCE
                                    ?: Room.databaseBuilder(
                                                    context.applicationContext,
                                                    AppDatabase::class.java,
                                                    "naplistener.db"
                                            )
                                            .setJournalMode(JournalMode.WRITE_AHEAD_LOGGING)
                                            .fallbackToDestructiveMigration()
                                            .build()
                                            .also { INSTANCE = it }
                        }
    }
}
