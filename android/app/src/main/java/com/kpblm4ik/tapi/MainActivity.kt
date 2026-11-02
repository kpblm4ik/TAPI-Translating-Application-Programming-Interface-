package com.kpblm4ik.tapi

import android.app.Activity
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView

class MainActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val pad = (16 * resources.displayMetrics.density).toInt()

        val root = LinearLayout(this)
        root.orientation = LinearLayout.VERTICAL
        root.setPadding(pad, pad, pad, pad)

        val intro = TextView(this)
        intro.text = "Введи слово или выдели текст в любом приложении и выбери «TAPI перевод» в меню."
        intro.textSize = 16f

        val input = EditText(this)
        input.setHint("слово или фраза")

        val btn = Button(this)
        btn.text = "Перевести"

        val out = TextView(this)
        out.textSize = 18f

        btn.setOnClickListener {
            val hit = Dict.lookup(this, input.text.toString())
            out.text = if (hit != null) "RU: ${hit.first}\nEN: ${hit.second}" else "Не найдено в словаре TAPI"
        }

        root.addView(intro)
        root.addView(input)
        root.addView(btn)
        root.addView(out)
        setContentView(root)
    }
}
