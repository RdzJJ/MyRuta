import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/ruta.dart';

class RutaService {
  // Para web y iOS: usa localhost
  // Para Android emulator: cambia a 'http://10.0.2.2:3000/api'
  final String baseUrl = 'http://localhost:3000/api';

  /// Obtiene todas las rutas con opciones de filtrado y paginación
  Future<List<Ruta>> obtenerRutas({
    String search = '',
    int limit = 50,
    int offset = 0,
  }) async {
    try {
      String url = '$baseUrl/rutas?limit=$limit&offset=$offset';
      if (search.isNotEmpty) {
        url += '&search=$search';
      }

      final response = await http.get(Uri.parse(url));

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        if (data['success'] == true && data['data'] != null) {
          final List<dynamic> rutasJson = data['data'];
          return rutasJson.map((r) => Ruta.fromJson(r)).toList();
        }
        return [];
      } else if (response.statusCode == 404) {
        return [];
      } else {
        throw Exception('Error al cargar rutas: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error en obtenerRutas: $e');
    }
  }

  /// Obtiene una ruta específica por ID
  Future<Ruta> obtenerRuta(String id) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/rutas/$id'));

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        if (data['success'] == true && data['data'] != null) {
          return Ruta.fromJson(data['data']);
        }
        throw Exception('Datos inválidos');
      } else {
        throw Exception('Error al cargar ruta: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error en obtenerRuta: $e');
    }
  }

  /// Obtiene las paradas de una ruta específica
  Future<List<Parada>> obtenerParadas(String rutaId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/rutas/$rutaId/stops'),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        if (data['success'] == true && data['data'] != null) {
          final List<dynamic> paradasJson = data['data'];
          return paradasJson.map((p) => Parada.fromJson(p)).toList();
        }
        return [];
      } else {
        throw Exception('Error al cargar paradas: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error en obtenerParadas: $e');
    }
  }

  /// Busca rutas por término de búsqueda
  Future<List<Ruta>> buscarRutas(String query) async {
    try {
      if (query.isEmpty) {
        return [];
      }
      return await obtenerRutas(search: query);
    } catch (e) {
      throw Exception('Error en buscarRutas: $e');
    }
  }

  /// Obtiene rutas activas de una ciudad específica
  Future<List<Ruta>> obtenerRutasPorCiudad(String ciudad) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/rutas?ciudad=$ciudad'),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        if (data['success'] == true && data['data'] != null) {
          final List<dynamic> rutasJson = data['data'];
          return rutasJson
              .map((r) => Ruta.fromJson(r))
              .where((ruta) => ruta.active)
              .toList();
        }
        return [];
      } else {
        throw Exception('Error al cargar rutas de la ciudad: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error en obtenerRutasPorCiudad: $e');
    }
  }
}
