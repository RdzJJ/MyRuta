/// Modelo de Ruta
class Ruta {
  final String id;
  final String numero; // Ej: "Ruta 135"
  final String nombre;
  final String linea; // Ej: "Línea 4"
  final String estado; // "activa", "inactiva"
  final double distancia; // en km
  final int tiempoEstimado; // en minutos
  final String ubicacionActual;
  final String proximaParada;
  final bool enVivo;
  final String imageUrl;
  final DateTime ultimaActualizacion;

  Ruta({
    required this.id,
    required this.numero,
    required this.nombre,
    required this.linea,
    required this.estado,
    required this.distancia,
    required this.tiempoEstimado,
    required this.ubicacionActual,
    required this.proximaParada,
    required this.enVivo,
    required this.imageUrl,
    required this.ultimaActualizacion,
  });

  factory Ruta.fromJson(Map<String, dynamic> json) {
    return Ruta(
      id: json['id'] ?? '',
      numero: json['numero'] ?? '',
      nombre: json['nombre'] ?? '',
      linea: json['linea'] ?? '',
      estado: json['estado'] ?? 'inactiva',
      distancia: (json['distancia'] as num?)?.toDouble() ?? 0.0,
      tiempoEstimado: json['tiempoEstimado'] ?? 0,
      ubicacionActual: json['ubicacionActual'] ?? '',
      proximaParada: json['proximaParada'] ?? '',
      enVivo: json['enVivo'] ?? false,
      imageUrl: json['imageUrl'] ?? '',
      ultimaActualizacion: DateTime.tryParse(json['ultimaActualizacion'] ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'numero': numero,
    'nombre': nombre,
    'linea': linea,
    'estado': estado,
    'distancia': distancia,
    'tiempoEstimado': tiempoEstimado,
    'ubicacionActual': ubicacionActual,
    'proximaParada': proximaParada,
    'enVivo': enVivo,
    'imageUrl': imageUrl,
    'ultimaActualizacion': ultimaActualizacion.toIso8601String(),
  };
}

/// Modelo de Viaje Activo
class ViajeActivo {
  final String id;
  final String rutaId;
  final String rutaNumero;
  final String estado; // "iniciado", "en_progreso", "finalizado"
  final double velocidad; // km/h
  final int tiempoEstimado; // minutos restantes
  final String ubicacionActual;
  final String destino;
  final int paradasRestantes;
  final double progreso; // 0.0 a 1.0
  final DateTime horaInicio;
  final DateTime? horaEstimadaLlegada;

  ViajeActivo({
    required this.id,
    required this.rutaId,
    required this.rutaNumero,
    required this.estado,
    required this.velocidad,
    required this.tiempoEstimado,
    required this.ubicacionActual,
    required this.destino,
    required this.paradasRestantes,
    required this.progreso,
    required this.horaInicio,
    required this.horaEstimadaLlegada,
  });

  factory ViajeActivo.fromJson(Map<String, dynamic> json) {
    return ViajeActivo(
      id: json['id'] ?? '',
      rutaId: json['rutaId'] ?? '',
      rutaNumero: json['rutaNumero'] ?? '',
      estado: json['estado'] ?? '',
      velocidad: (json['velocidad'] as num?)?.toDouble() ?? 0.0,
      tiempoEstimado: json['tiempoEstimado'] ?? 0,
      ubicacionActual: json['ubicacionActual'] ?? '',
      destino: json['destino'] ?? '',
      paradasRestantes: json['paradasRestantes'] ?? 0,
      progreso: (json['progreso'] as num?)?.toDouble() ?? 0.0,
      horaInicio: DateTime.tryParse(json['horaInicio'] ?? '') ?? DateTime.now(),
      horaEstimadaLlegada: DateTime.tryParse(json['horaEstimadaLlegada'] ?? ''),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'rutaId': rutaId,
    'rutaNumero': rutaNumero,
    'estado': estado,
    'velocidad': velocidad,
    'tiempoEstimado': tiempoEstimado,
    'ubicacionActual': ubicacionActual,
    'destino': destino,
    'paradasRestantes': paradasRestantes,
    'progreso': progreso,
    'horaInicio': horaInicio.toIso8601String(),
    'horaEstimadaLlegada': horaEstimadaLlegada?.toIso8601String(),
  };
}

/// Modelo de Usuario
class Usuario {
  final String id;
  final String nombre;
  final String email;
  final String rol; // "cliente", "conductor"
  final String telefono;
  final String fotoPerfil;
  final DateTime fechaRegistro;

  Usuario({
    required this.id,
    required this.nombre,
    required this.email,
    required this.rol,
    required this.telefono,
    required this.fotoPerfil,
    required this.fechaRegistro,
  });

  factory Usuario.fromJson(Map<String, dynamic> json) {
    return Usuario(
      id: json['id'] ?? '',
      nombre: json['nombre'] ?? '',
      email: json['email'] ?? '',
      rol: json['rol'] ?? 'cliente',
      telefono: json['telefono'] ?? '',
      fotoPerfil: json['fotoPerfil'] ?? '',
      fechaRegistro: DateTime.tryParse(json['fechaRegistro'] ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'nombre': nombre,
    'email': email,
    'rol': rol,
    'telefono': telefono,
    'fotoPerfil': fotoPerfil,
    'fechaRegistro': fechaRegistro.toIso8601String(),
  };
}

/// Modelo de Localización
class Localizacion {
  final double latitud;
  final double longitud;
  final double precision;
  final DateTime timestamp;

  Localizacion({
    required this.latitud,
    required this.longitud,
    required this.precision,
    required this.timestamp,
  });

  factory Localizacion.fromJson(Map<String, dynamic> json) {
    return Localizacion(
      latitud: (json['latitud'] as num?)?.toDouble() ?? 0.0,
      longitud: (json['longitud'] as num?)?.toDouble() ?? 0.0,
      precision: (json['precision'] as num?)?.toDouble() ?? 0.0,
      timestamp: DateTime.tryParse(json['timestamp'] ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
    'latitud': latitud,
    'longitud': longitud,
    'precision': precision,
    'timestamp': timestamp.toIso8601String(),
  };
}
