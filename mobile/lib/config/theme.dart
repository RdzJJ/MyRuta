import 'package:flutter/material.dart';

/// Design System - MyRuta App
/// Tema oscuro con acentos verde neón

class AppColors {
  // Colores principales
  static const Color primary = Color(0xFF00FF88); // Verde neón
  static const Color primaryDark = Color(0xFF00CC6A);
  static const Color primaryLight = Color(0xFF33FF99);

  // Fondos
  static const Color background = Color(0xFF0A0A0A); // Negro profundo
  static const Color surface = Color(0xFF1A1A1A); // Gris oscuro
  static const Color surfaceLight = Color(0xFF2A2A2A); // Gris más claro

  // Texto
  static const Color textPrimary = Color(0xFFFFFFFF); // Blanco
  static const Color textSecondary = Color(0xFFB0B0B0); // Gris claro
  static const Color textTertiary = Color(0xFF808080); // Gris medio

  // Estados
  static const Color success = Color(0xFF00FF88);
  static const Color warning = Color(0xFFFFB800);
  static const Color error = Color(0xFFFF4444);
  static const Color info = Color(0xFF00B8FF);

  // Bordes
  static const Color border = Color(0xFF3A3A3A);
  static const Color borderLight = Color(0xFF4A4A4A);

  // Actividad en vivo
  static const Color activeLive = Color(0xFF00FF88);
}

class AppTheme {
  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    
    // Colores primarios
    primaryColor: AppColors.primary,
    scaffoldBackgroundColor: AppColors.background,
    
    // Color Scheme
    colorScheme: const ColorScheme.dark(
      primary: AppColors.primary,
      secondary: AppColors.primaryLight,
      surface: AppColors.surface,
      error: AppColors.error,
      background: AppColors.background,
    ),

    // AppBar
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.background,
      foregroundColor: AppColors.textPrimary,
      elevation: 0,
      centerTitle: true,
    ),

    // Botones
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.background,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        elevation: 0,
      ),
    ),

    // Botones de contorno
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.primary,
        side: const BorderSide(color: AppColors.primary, width: 1.5),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    ),

    // TextField
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.surface,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.primary, width: 2),
      ),
      hintStyle: const TextStyle(color: AppColors.textSecondary),
      labelStyle: const TextStyle(color: AppColors.textSecondary),
    ),

    // Tipografía
    textTheme: const TextTheme(
      displayLarge: TextStyle(
        fontSize: 32,
        fontWeight: FontWeight.bold,
        color: AppColors.textPrimary,
      ),
      displayMedium: TextStyle(
        fontSize: 28,
        fontWeight: FontWeight.bold,
        color: AppColors.textPrimary,
      ),
      displaySmall: TextStyle(
        fontSize: 24,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      ),
      headlineSmall: TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      ),
      titleLarge: TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      ),
      titleMedium: TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w500,
        color: AppColors.textPrimary,
      ),
      titleSmall: TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: AppColors.textSecondary,
      ),
      bodyLarge: TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.normal,
        color: AppColors.textPrimary,
      ),
      bodyMedium: TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.normal,
        color: AppColors.textPrimary,
      ),
      bodySmall: TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.normal,
        color: AppColors.textSecondary,
      ),
    ),

    // BottomNavigationBar
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: AppColors.surface,
      selectedItemColor: AppColors.primary,
      unselectedItemColor: AppColors.textSecondary,
      elevation: 8,
      type: BottomNavigationBarType.fixed,
    ),
  );
}

/// Sombras reutilizables
class AppShadows {
  static const List<BoxShadow> small = [
    BoxShadow(
      color: Color(0x0D000000),
      blurRadius: 4,
      offset: Offset(0, 2),
    ),
  ];

  static const List<BoxShadow> medium = [
    BoxShadow(
      color: Color(0x19000000),
      blurRadius: 8,
      offset: Offset(0, 4),
    ),
  ];

  static const List<BoxShadow> large = [
    BoxShadow(
      color: Color(0x26000000),
      blurRadius: 16,
      offset: Offset(0, 8),
    ),
  ];

  // Sombra con verde neón sutil
  static const List<BoxShadow> neonGreen = [
    BoxShadow(
      color: Color(0x4D00FF88),
      blurRadius: 12,
      offset: Offset(0, 4),
    ),
  ];
}
