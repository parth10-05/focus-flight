package com.aerofocus.appblocker

import android.graphics.Color
import android.os.Bundle
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class BlockedActivity : AppCompatActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    val blockedPackage = intent.getStringExtra("blockedPackage") ?: "this app"

    val container = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      setBackgroundColor(Color.parseColor("#09090B"))
      setPadding(48, 96, 48, 96)
    }

    val title = TextView(this).apply {
      text = "Mission Lock Active"
      textSize = 28f
      setTextColor(Color.parseColor("#38BDF8"))
    }

    val subtitle = TextView(this).apply {
      text = "Blocked: $blockedPackage"
      textSize = 16f
      setTextColor(Color.parseColor("#A1A1AA"))
      setPadding(0, 24, 0, 0)
    }

    container.addView(title)
    container.addView(subtitle)

    setContentView(container)
  }
}
