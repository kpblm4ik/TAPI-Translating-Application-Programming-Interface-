package com.kpblm4ik.tapi

import android.content.Context
import org.json.JSONObject

object Dict {
    private var map: Map<String, Pair<String, String>>? = null

    private fun load(ctx: Context): Map<String, Pair<String, String>> {
        map?.let { return it }
        val text = ctx.assets.open("dictionary.json").bufferedReader().use { it.readText() }
        val d = JSONObject(text).getJSONObject("dictionary")
        val m = HashMap<String, Pair<String, String>>()
        for (k in d.keys()) {
            val o = d.getJSONObject(k)
            m[k.lowercase().trim()] = o.optString("literary_ru") to o.optString("translation_en")
        }
        map = m
        return m
    }

    /** Возвращает (русское значение, английский перевод) или null. */
    fun lookup(ctx: Context, text: String): Pair<String, String>? {
        val dict = load(ctx)
        val clean = text.lowercase().trim()
        dict[clean]?.let { return it }
        for (w in clean.split(Regex("[\\s,.!?;:()\"«»]+"))) {
            dict[w]?.let { return it }
        }
        return null
    }
}
