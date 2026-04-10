package com.aerofocus.appblocker

// NOTE: This module requires manual AndroidManifest.xml additions.
// Required entries include:
// 1) <uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />
// 2) <uses-permission android:name="android.permission.PACKAGE_USAGE_STATS" tools:ignore="ProtectedPermissions" />
// 3) <service ... AppBlockerAccessibilityService ... android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"> + metadata config
// 4) <activity ... BlockedActivity ... > declaration

import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class AppBlockerModule : Module() {
  companion object {
    const val PREFS_NAME = "aerofocus_app_blocker"
    const val KEY_BLOCKED_PACKAGES = "blocked_packages"
  }

  override fun definition() = ModuleDefinition {
    Name("AppBlocker")

    AsyncFunction("requestPermission") {
      val context = appContext.reactContext ?: throw IllegalStateException("React context is not available")
      val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      context.startActivity(intent)

      hasUsageStatsPermission(context)
    }

    AsyncFunction("hasPermission") {
      val context = appContext.reactContext ?: throw IllegalStateException("React context is not available")
      hasUsageStatsPermission(context)
    }

    AsyncFunction("startBlocking") { packageNames: List<String> ->
      val context = appContext.reactContext ?: throw IllegalStateException("React context is not available")
      val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      prefs.edit()
        .putStringSet(KEY_BLOCKED_PACKAGES, packageNames.map { it.trim() }.filter { it.isNotEmpty() }.toSet())
        .apply()

      // Opens accessibility settings so the user can enable AppBlockerAccessibilityService.
      val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      context.startActivity(intent)
    }

    AsyncFunction("stopBlocking") {
      val context = appContext.reactContext ?: throw IllegalStateException("React context is not available")
      val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      prefs.edit().remove(KEY_BLOCKED_PACKAGES).apply()
    }

    AsyncFunction("isBlocking") {
      val context = appContext.reactContext ?: throw IllegalStateException("React context is not available")
      val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      !prefs.getStringSet(KEY_BLOCKED_PACKAGES, emptySet()).isNullOrEmpty()
    }
  }

  private fun hasUsageStatsPermission(context: Context): Boolean {
    val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      appOps.unsafeCheckOpNoThrow(
        AppOpsManager.OPSTR_GET_USAGE_STATS,
        android.os.Process.myUid(),
        context.packageName
      )
    } else {
      @Suppress("DEPRECATION")
      appOps.checkOpNoThrow(
        AppOpsManager.OPSTR_GET_USAGE_STATS,
        android.os.Process.myUid(),
        context.packageName
      )
    }

    return mode == AppOpsManager.MODE_ALLOWED
  }
}
