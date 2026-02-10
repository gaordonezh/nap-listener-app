package com.netappperu.naplistener.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query

@Dao
interface NotificationDao {

    @Insert fun insert(notification: NotificationEntity)

    @Query(
            """
            SELECT * FROM notifications
            ORDER BY timestamp DESC
            LIMIT :limit OFFSET :offset
            """
    )
    fun getPaged(limit: Int, offset: Int): List<NotificationEntity>

    @Query("DELETE FROM notifications WHERE timestamp < :limit")
    fun deleteOlderThan(limit: Long): Int

    @Query(
            """
            SELECT * FROM notifications 
            WHERE sent = 0 
            ORDER BY timestamp ASC 
            LIMIT :limit
            """
    )
    fun getUnsent(limit: Int): List<NotificationEntity>

    @Query(
            """
            UPDATE notifications 
            SET sent = 1
            WHERE id IN (:ids)
            """
    )
    fun markAsSent(ids: List<Long>)
}
