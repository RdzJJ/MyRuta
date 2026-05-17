/// Modelo de Ruta (Compatible con Backend)
class Ruta {
  final String id;
  final String name;
  final String code;
  final String startStop;
  final String endStop;
  final String? description;
  final bool active;
  final List<Parada> stops;
  final List<Conductor> conductors;
  final DateTime createdAt;
  final DateTime updatedAt;

  Ruta({
    required this.id,
    required this.name,
    required this.code,
    required this.startStop,
    required this.endStop,
    this.description,
    required this.active,
    this.stops = const [],
    this.conductors = const [],
    required this.createdAt,
    required this.updatedAt,
  });

  factory Ruta.fromJson(Map<String, dynamic> json) {
    return Ruta(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      code: json['code'] ?? '',
      startStop: json['startStop'] ?? '',
      endStop: json['endStop'] ?? '',
      description: json['description'],
      active: json['active'] ?? true,
      stops: (json['stops'] as List?)
          ?.map((p) => Parada.fromJson(p))
          .toList() ?? [],
      conductors: (json['conductors'] as List?)
          ?.map((c) => Conductor.fromJson(c))
          .toList() ?? [],
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updatedAt'] ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'code': code,
    'startStop': startStop,
    'endStop': endStop,
    'description': description,
    'active': active,
    'stops': stops.map((p) => p.toJson()).toList(),
    'conductors': conductors.map((c) => c.toJson()).toList(),
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt.toIso8601String(),
  };
}

/// Modelo de Parada
class Parada {
  final String id;
  final String rutaId;
  final String name;
  final double latitude;
  final double longitude;
  final int order;
  final DateTime createdAt;
  final DateTime updatedAt;

  Parada({
    required this.id,
    required this.rutaId,
    required this.name,
    required this.latitude,
    required this.longitude,
    required this.order,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Parada.fromJson(Map<String, dynamic> json) {
    return Parada(
      id: json['id'] ?? '',
      rutaId: json['rutaId'] ?? '',
      name: json['name'] ?? '',
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0.0,
      order: json['order'] ?? 0,
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updatedAt'] ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'rutaId': rutaId,
    'name': name,
    'latitude': latitude,
    'longitude': longitude,
    'order': order,
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt.toIso8601String(),
  };
}

/// Modelo de Conductor
class Conductor {
  final String id;
  final String userId;
  final String? licenseNo;
  final String? vehicle;
  final String? plateNo;
  final bool active;
  final UsuarioInfo? user;
  final DateTime createdAt;
  final DateTime updatedAt;

  Conductor({
    required this.id,
    required this.userId,
    this.licenseNo,
    this.vehicle,
    this.plateNo,
    required this.active,
    this.user,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Conductor.fromJson(Map<String, dynamic> json) {
    return Conductor(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      licenseNo: json['licenseNo'],
      vehicle: json['vehicle'],
      plateNo: json['plateNo'],
      active: json['active'] ?? true,
      user: json['user'] != null ? UsuarioInfo.fromJson(json['user']) : null,
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updatedAt'] ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'userId': userId,
    'licenseNo': licenseNo,
    'vehicle': vehicle,
    'plateNo': plateNo,
    'active': active,
    'user': user?.toJson(),
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt.toIso8601String(),
  };
}

/// Modelo de Usuario (Info básica)
class UsuarioInfo {
  final String firstName;
  final String lastName;
  final String? phone;

  UsuarioInfo({
    required this.firstName,
    required this.lastName,
    this.phone,
  });

  factory UsuarioInfo.fromJson(Map<String, dynamic> json) {
    return UsuarioInfo(
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      phone: json['phone'],
    );
  }

  Map<String, dynamic> toJson() => {
    'firstName': firstName,
    'lastName': lastName,
    'phone': phone,
  };

  String get nombreCompleto => '$firstName $lastName';
}
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
