package com.aerofocus.appblocker

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.content.Intent
import android.view.accessibility.AccessibilityEvent

class AppBlockerAccessibilityService : AccessibilityService() {
  override fun onAccessibilityEvent(event: AccessibilityEvent?) {
    if (event == null || event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
      return
    }

    val packageName = event.packageName?.toString() ?: return
    if (!isPackageBlocked(packageName)) {
      return
    }

    val overlayIntent = Intent(this, BlockedActivity::class.java).apply {
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
      putExtra("blockedPackage", packageName)
    }
    startActivity(overlayIntent)

    performGlobalAction(GLOBAL_ACTION_BACK)
  }

  override fun onInterrupt() {
    // No-op
  }

  private fun isPackageBlocked(packageName: String): Boolean {
    val prefs = getSharedPreferences(AppBlockerModule.PREFS_NAME, Context.MODE_PRIVATE)
    val blocked = prefs.getStringSet(AppBlockerModule.KEY_BLOCKED_PACKAGES, emptySet()) ?: emptySet()
    return blocked.contains(packageName)
  }
}
