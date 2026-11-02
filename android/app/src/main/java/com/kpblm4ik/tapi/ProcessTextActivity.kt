package com.kpblm4ik.tapi

import android.app.Activity
import android.app.AlertDialog
import android.content.Intent
import android.os.Bundle

/** Появляется в меню выделенного текста в любом приложении как «TAPI перевод». */
class ProcessTextActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val text = intent.getCharSequenceExtra(Intent.EXTRA_PROCESS_TEXT)?.toString().orEmpty()
        val hit = Dict.lookup(this, text)
        val msg = if (hit != null) "RU: ${hit.first}\nEN: ${hit.second}" else "Не найдено в словаре TAPI"
        AlertDialog.Builder(this)
            .setTitle(text.take(40))
            .setMessage(msg)
            .setPositiveButton("OK") { _, _ -> finish() }
            .setOnCancelListener { finish() }
            .show()
    }
}
