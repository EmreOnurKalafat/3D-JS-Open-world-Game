// shared/constants.js — Single source of truth for all game constants

export const NETWORK = {
  PORT: 3000,
  TICK_RATE: 20,
  INTERPOLATION_DELAY: 100,
  MAX_PLAYERS_PER_ROOM: 32,
  HEARTBEAT_INTERVAL: 5000,
  TIMEOUT_MS: 10000,
  MAX_POSITION_DELTA: 2.0,
};

export const WORLD = {
  GRID_SIZE: 10,
  BLOCK_SIZE: 60,
  ROAD_WIDTH: 12,
  BUILDING_MIN_HEIGHT: 8,
  BUILDING_MAX_HEIGHT: 80,
  WATER_Y: -2,
  GRAVITY: -20,
  SPAWN_POINTS: [
    { x: 30, y: 2, z: 30 },
    { x: -30, y: 2, z: 30 },
    { x: 30, y: 2, z: -30 },
    { x: -30, y: 2, z: -30 },
    { x: 0, y: 2, z: 60 },
  ],
};

export const PLAYER = {
  WALK_SPEED: 5,
  RUN_SPEED: 10,
  SPRINT_SPEED: 16,
  SWIM_SPEED: 3,
  JUMP_FORCE: 8,
  MAX_HP: 100,
  MAX_ARMOR: 100,
  STARTING_MONEY: 5000,
  CAPSULE_RADIUS: 0.4,
  CAPSULE_HEIGHT: 1.8,
  CAMERA_OFFSET: { x: 0.6, y: 1.4, z: -3.5 },
  INTERACTION_DISTANCE: 3,
  SWIM_THRESHOLD_Y: -0.5,
  REGEN_RATE: 1,
  REGEN_DELAY: 5,
  NAME_MAX_LENGTH: 16,
  NAME_MIN_LENGTH: 2,
};

export const VEHICLE = {
  TYPES: {
    SEDAN:      { mass: 1200, maxSpeed: 28, engineForce: 2000, brakeForce: 60,  steerAngle: 0.5,  suspStiffness: 30, model: 'sedan'      },
    SPORTS:     { mass: 900,  maxSpeed: 45, engineForce: 3500, brakeForce: 80,  steerAngle: 0.45, suspStiffness: 40, model: 'sports'     },
    SUV:        { mass: 1800, maxSpeed: 22, engineForce: 2500, brakeForce: 55,  steerAngle: 0.48, suspStiffness: 25, model: 'suv'        },
    TRUCK:      { mass: 3000, maxSpeed: 18, engineForce: 3000, brakeForce: 45,  steerAngle: 0.4,  suspStiffness: 20, model: 'truck'      },
    MOTORCYCLE: { mass: 200,  maxSpeed: 52, engineForce: 1500, brakeForce: 40,  steerAngle: 0.55, suspStiffness: 45, model: 'motorcycle' },
    HELICOPTER: { mass: 800,  maxSpeed: 30, liftForce: 12000,                                                        model: 'helicopter' },
    BOAT:       { mass: 600,  maxSpeed: 20, engineForce: 1000,                                                        model: 'boat'       },
    POLICE_CAR: { mass: 1400, maxSpeed: 35, engineForce: 2800, brakeForce: 70,  steerAngle: 0.5,  suspStiffness: 32, model: 'police_car' },
  },
  ENTER_DISTANCE: 3,
  DAMAGE_SMOKE_THRESHOLD: 60,
  DAMAGE_FIRE_THRESHOLD: 90,
  EXPLOSION_DAMAGE: 150,
  EXPLOSION_RADIUS: 8,
};

export const WEAPONS = {
  FIST:         { damage: 15,  range: 1.5,  fireRate: 0.8,  ammo: Infinity, reloadTime: 0,   type: 'melee'  },
  KNIFE:        { damage: 35,  range: 1.8,  fireRate: 0.5,  ammo: Infinity, reloadTime: 0,   type: 'melee'  },
  BASEBALL_BAT: { damage: 45,  range: 2.0,  fireRate: 0.6,  ammo: Infinity, reloadTime: 0,   type: 'melee'  },
  PISTOL:       { damage: 25,  range: 60,   fireRate: 0.4,  ammo: 12,  reserve: 120, reloadTime: 1.2, type: 'gun' },
  SHOTGUN:      { damage: 80,  range: 20,   fireRate: 0.9,  ammo: 8,   reserve: 40,  reloadTime: 2.0, type: 'gun', pellets: 8 },
  SMG:          { damage: 18,  range: 50,   fireRate: 0.1,  ammo: 30,  reserve: 150, reloadTime: 1.5, type: 'gun' },
  ASSAULT_RIFLE:{ damage: 30,  range: 100,  fireRate: 0.12, ammo: 30,  reserve: 150, reloadTime: 2.0, type: 'gun' },
  SNIPER:       { damage: 120, range: 400,  fireRate: 1.5,  ammo: 5,   reserve: 30,  reloadTime: 3.0, type: 'gun', breathHold: true },
  RPG:          { damage: 200, range: 200,  fireRate: 3.0,  ammo: 1,   reserve: 5,   reloadTime: 4.0, type: 'explosive', splashRadius: 8 },
  GRENADE:      { damage: 150, range: 30,   fuseTime: 3.0,  ammo: 3,   reserve: 10,                   type: 'thrown',    splashRadius: 6 },
  MINIGUN:      { damage: 20,  range: 80,   fireRate: 0.05, ammo: 200, reserve: 600, reloadTime: 4.0, type: 'gun', warmupTime: 0.8 },
};

export const COMBAT = {
  HEADSHOT_MULTIPLIER: 2.0,
  LEG_SHOT_SLOW: 0.5,
  ARM_SHOT_DROP_CHANCE: 0.3,
  ARMOR_ABSORPTION: 0.5,
  RAGDOLL_IMPULSE_THRESHOLD: 50,
  BULLET_TRACER_DURATION: 0.08,
};

export const WANTED = {
  TRIGGERS: {
    MINOR_COLLISION: 0.5,
    ASSAULT_NPC: 1,
    STEAL_VEHICLE: 1,
    KILL_NPC: 2,
    ARMED_ROBBERY: 2,
    KILL_COP: 2,
    DESTROY_POLICE_CAR: 1.5,
    MILITARY_TRESPASS: 3,
  },
  DECAY_HIDDEN_SECONDS: 15,
  DECAY_RATE: 1,
  BRIBE_COST_PER_STAR: 1000,
  PAY_N_SPRAY_COST_PER_STAR: 500,
  SEARCH_RADIUS: 80,
  VISION_CONE_ANGLE: 60,
  VISION_RANGE: 40,
};

export const ECONOMY = {
  NPC_ROB_MIN: 200,
  NPC_ROB_MAX: 500,
  STORE_ROB_MIN: 1000,
  STORE_ROB_MAX: 3000,
  BANK_ROB_MIN: 10000,
  BANK_ROB_MAX: 50000,
  DEATH_HOSPITAL_FEE: 1000,
  KILL_REWARD_DEATHMATCH: 500,
  DEATH_PENALTY_DEATHMATCH: 250,
};

export const CHAT = {
  LOCAL_RADIUS: 30,
  MAX_MESSAGE_LENGTH: 200,
  MAX_VISIBLE_MESSAGES: 8,
  MESSAGE_FADE_MS: 8000,
  NAME_TAG_DISTANCE: 40,
};

export const VOICE = {
  PROXIMITY_MAX_DISTANCE: 50,
  PROXIMITY_REF_DISTANCE: 5,
  PUSH_TO_TALK_KEY: 'v',
};

export const AUDIO = {
  MASTER_VOLUME: 0.8,
  MUSIC_VOLUME: 0.3,
  SFX_VOLUME: 1.0,
  VOICE_VOLUME: 1.0,
};

export const GAME_MODES = {
  FREE_ROAM: 'free_roam',
  DEATHMATCH: 'deathmatch',
  TEAM_DEATHMATCH: 'team_deathmatch',
  COPS_ROBBERS: 'cops_robbers',
  LAST_STANDING: 'last_standing',
  STREET_RACE: 'street_race',
  KING_HILL: 'king_of_the_hill',
};

export const SOCKET_EVENTS = {
  PLAYER_JOIN:       'player_join',
  PLAYER_LEAVE:      'player_leave',
  GAME_STATE:        'game_state',
  PLAYER_MOVE:       'player_move',
  PLAYER_MOVED:      'player_moved',
  PLAYER_SHOOT:      'player_shoot',
  PLAYER_HIT:        'player_hit',
  PLAYER_DEAD:       'player_dead',
  PLAYER_RESPAWN:    'player_respawn',
  EXPLOSION_AT:      'explosion_at',
  VEHICLE_ENTER:     'vehicle_enter',
  VEHICLE_EXIT:      'vehicle_exit',
  VEHICLE_MOVE:      'vehicle_move',
  VEHICLE_DAMAGE:    'vehicle_damage',
  VEHICLE_EXPLODE:   'vehicle_explode',
  CHAT_MESSAGE:      'chat_message',
  CHAT_RECEIVED:     'chat_received',
  VOICE_SIGNAL:      'voice_signal',
  KILL_FEED:         'kill_feed',
  EMOTE:             'emote',
  WANTED_CHANGE:     'wanted_change',
  MONEY_CHANGE:      'money_change',
  PICKUP_TAKEN:      'pickup_taken',
  HEIST_EVENT:       'heist_event',
  MODE_UPDATE:       'mode_update',
  PLAYER_LIST:       'player_list',
};
