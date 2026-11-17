# Client NBT keys for network custom blocks and items

Builds: Android 1.26.52.3 libminecraftpe.so (Ghidra project mcpe2, VA = file offset + 0x100000) and Windows 1.26.65 Minecraft.Windows.exe (mcwin65, unanalyzed, image base 0x140000000). Addresses are Ghidra VAs.

Legend: SEEN = read in decompiled client code. WRITER-ONLY = written by the server-side writer in the same binary, no client read found. INFERRED = deduced from structure, not read line by line. UNKNOWN = not confirmed.

## NBT getter semantics (Android, SEEN)

Getters are strict: a key whose tag type differs is treated as missing and returns the default. No coercion was seen.

| Function | Tag type id | Returns when missing or wrong type |
|---|---|---|
| 0x11303f20 | Byte (1), read as bool | false |
| 0x113036a4 | Byte (1), raw byte | 0 |
| 0x1130389c | Int (3) | 0 |
| 0x11303a94 | Float (5) | 0.0 |
| 0x11303b90 | String (8) | empty string |
| 0x11303e18 | List (9) | null |
| 0x11303d10 | Compound (10) | null |
| 0x11303818 | Int (3), returns tag pointer | null |
| 0x113033d4 | any tag, returns tag pointer | null |
| 0x11303310 | contains(key) | false |

0x1130c468 builds a cereal SchemaReader (vtable 0x132a2f50) directly over a Tag. Code that calls it loads a C++ type through its cereal schema straight from NBT, so those keys follow the behavior pack JSON member names. It is not an NBT to JSON conversion.

## Blocks (StartGamePacket BlockProperties entry: name + compound)

Client reader: Android 0x1057f480. Windows 1.26.65: 0x1431bd2a0, reached through the thunk 0x142332e40 (`mov rcx,[rcx+0x110]; add rdx,0x690; jmp 0x1431bd2a0`). The Windows reader references the same key strings and no others (resolved list: molangVersion, vanilla_block_data, block_id, material, block_archetype, type, menu_category, group, category, is_hidden_in_commands, properties, name, enum, traits, components, permutations, blockTags, condition).
Server-side writer in the Android binary: 0x1057d750.

### Top level

| Key | NBT type | Missing or invalid | Status |
|---|---|---|---|
| molangVersion | Int | 0; values < 0 or >= 14 also become 0 | SEEN A:0x1057f480 |
| vanilla_block_data | Compound | block_id stays -1, material enum stays 1 | SEEN A:0x1057f480 |
| menu_category | Compound | the decompile shows no null check before the inner reads; behavior when absent UNKNOWN | SEEN A:0x1057f480 |
| properties | List of Compound | skipped | SEEN A:0x1057f480 |
| traits | List of Compound | skipped | SEEN A:0x1057f480 |
| components | Compound | parsed by 0x105814f4 | SEEN A:0x1057f480 |
| permutations | List of Compound | skipped | SEEN A:0x1057f480 |
| blockTags | List of String | none | SEEN A:0x1057f480 (top level and per permutation), W:0x1431bd2a0 |

The block name is checked for the "minecraft" namespace (0x0f8ac1a8, immediate compare "minecraf"+"t"). The result is only stored as a flag in the parsed definition. It gates nothing inside the reader.

### vanilla_block_data

| Key | NBT type | Missing | Status |
|---|---|---|---|
| block_id | Int | 0 (when the compound exists) | SEEN A:0x1057f480 |
| material | String, mapped through a static table (0x11bfa940) | unknown name gives enum value 1 | SEEN A:0x1057f480 |
| block_archetype | Compound | none | SEEN A:0x1057f480 |
| block_archetype.type | String; looked up in a 27-entry table (0x1055c998) | no match: archetype skipped | SEEN |
| block_archetype other keys | loaded by the archetype's cereal schema over NBT (0x1130c468 in bush 0x105b2994 and stair 0x105bfecc) | | INFERRED keys = JSON schema of SharedTypes::v1_26_20::BlockDefinition::*Archetype, not enumerated |
| translucency | Float | | WRITER-ONLY (A:0x1057d750); client reader does not read it (A and W) |
| can_dampen_vibrations | Byte | | WRITER-ONLY |
| can_occlude_vibrations | Byte | | WRITER-ONLY |
| requires_correct_tool_for_drops | Byte | | WRITER-ONLY |

Archetype type names (A:0x1055c998): bush_block, button_block, carpet_block, crop_block, dirt_block, door_block, double_sapling_block, farm_block, fence_block, fence_gate_block, flower_bed_block, hanging_sign_block, leaves_block, log_block, path_block, planks_block, pressure_plate_block, pumpkin_block, sapling_block, shelf_block, sign_block, slab_block, stair_block, stripped_log_block, trapdoor_block, wall_foliage_block, wall_sign_block.

The four writer-only keys also appear in the JSON cereal schema for VanillaBlockData (A:0x11b40000, with block_id, material, block_archetype). So JSON packs can set them, but a server cannot send them to the client through this packet.

### menu_category

| Key | NBT type | Missing or invalid | Status |
|---|---|---|---|
| category | String | empty: error "Menu Category should not have an empty value"; unknown: error "Menu Category has an invalid value of %s"; both fall back to enum 5 | SEEN A:0x105813f0 |
| group | String | empty | SEEN |
| is_hidden_in_commands | Byte (bool) | false | SEEN |

### properties[i]

| Key | NBT type | Notes | Status |
|---|---|---|---|
| name | String | | SEEN |
| enum | List | copied as tags; the property's value type comes from the tag type id of element 0 | SEEN |

### traits[i]

`name` (String) selects the trait (0x1048f7b4). The trait then reads the same entry compound through its own virtual (slot 3).

| Trait reader | Keys | Status |
|---|---|---|
| placement_direction A:0x1049165c | enabled_states (Compound) { cardinal_direction, facing_direction, corner_and_cardinal_direction, sixteen_way_rotation : Byte bool }; y_rotation_offset Float; blocks_to_corner_with (any tag, cereal-loaded via 0x1130c468). y_rotation_offset and blocks_to_corner_with are read only when enabled_states exists | SEEN |
| placement_position A:0x10491d18 | enabled_states { block_face, vertical_half : Byte bool } | SEEN |
| multi_block A:0x10490ba0 | enabled_states { multi_block : Byte bool }; part_count Byte; direction Byte; place_behavior Byte | SEEN |
| A:0x1048fe28 (trait not identified, probably connection) | type Int; enabled_states Int (not a compound); update_flags Int | SEEN keys, trait identity UNKNOWN |

### permutations[i]

| Key | NBT type | Status |
|---|---|---|
| components | Compound, same parser as top level | SEEN |
| blockTags | List of String | SEEN |
| condition | String, compiled with molangVersion (0x0f829264) | SEEN |

### components

Parser A:0x105814f4. Each key must hold a Compound; other tag types are skipped. The name goes through the factory 0x1073f67c, unknown names are skipped silently, and "minecraft:container" gets a placeholder object when the factory has none. Each component then reads its compound in its description vtable slot 10 (+0x50). Block components are not deserialized through the JSON schema as a whole: there are three modes.

Hand-written NBT readers (SEEN, Android slot 10 address):

| Component class | Keys and types |
|---|---|
| BlockDisplayNameDescription 0x106d0610 | value String |
| BlockFrictionDescription 0x106d40a8 | value Float |
| BlockLightEmissionDescription 0x106dc3d8 | emission Byte |
| BlockLightDampeningDescription 0x106db8a8 | lightLevel Byte |
| BlockBreathabilityDescription 0x1073d900 | value Byte |
| BlockContainerDescription 0x106c3e88 | slot_count Byte |
| BlockRedstoneDescription 0x10653424 | redstoneConductor Byte; allowsWireToStepDown Byte |
| BlockSelectionBoxDescription 0x10657760 | enabled Byte bool; origin and size: tag read as 3 elements (0x11303fb0 index 0..2) |
| BlockCollisionBoxDescription 0x1073e5b8 | enabled Byte bool; boxes List of Compound { minX minY minZ maxX maxY maxZ : Float } (entry callback 0x10757828) |
| BlockDestructibleByMiningDescription 0x106cd9d4 | value Float; item_specific_speeds List of Compound { item Compound (inner keys UNKNOWN); destroy_speed Float } |
| BlockCraftingTableDescription 0x106c6394 | grid_size Int; table_name String; crafting_tags List of String |
| BlockPlacementFilterDescription 0x1064cfa8 | conditions List of Compound { allowed_faces Byte; block_filter List of Compound (inner keys UNKNOWN) } |
| BlockLiquidDetectionDescription 0x106ddd00 | detectionRules List of Compound { liquidType String; canContainLiquid Byte bool; onLiquidTouches String; stopsLiquidFromDirection Byte; use_liquid_clipping Byte bool } |
| BlockCustomComponentsComponentDescription 0x106c799c | isV1Component, hasPlayerInteract, hasPlayerPlacing : Byte bool; the client builds a "ClientDummyCustomComponent" |
| OnInteractTriggerDescription 0x105531e4 | triggerType String |
| OnPlayerPlacingTriggerDescription 0x10553810 | triggerType String |
| BlockTransformationDescription 0x1065c82c | TX TY TZ Float; RX RY RZ Int; RXP RYP RZP Float; SX SY SZ Float; SXP SYP SZP Float; hasJsonVersionBeforeValidation Byte bool |
| BlockMaterialInstancesDescription 0x10645e28 | materials Compound of Compound { texture String; render_method String; ambient_occlusion Float; packed_bools Byte; tint_method String }; mappings Compound of Compound { value String } (exact nesting of the last three fields is approximate) |
| BlockItemVisualDescription 0x106d9558 | geometryDescription Compound; materialInstancesDescription Compound |

Cereal schema over NBT, so keys = JSON member names (0x1130c468 SEEN, member names not enumerated): BlockGeometryDescription 0x106d95c8, BlockFlowerPottableDescription 0x106e01ac, BlockRandomOffsetDescription 0x1065e3f4, BlockPrecipitationInteractionsComponentDescription 0x1065dc3c, BlockSoundDescription 0x1065f25c, BlockRedstoneProducerDescription 0x1065ebc0, BlockSupportDescription 0x1065f8f0, BlockLeashableDescription 0x106e09fc, BlockConnectionRuleDescription 0x106de764, BlockDestructionParticlesDescription 0x106df1c4.

No NBT payload read (slot 10 empty: 0x105989ec or 0x105506a4/0x10655820). These components are created by name only and their compound content is ignored: unit_cube, replaceable, map_color, movable, loot, redstone_consumer, tick, queued_ticking, random_ticking, instrument, destructible_by_explosion, flammable, creative_group, entity_fall_on, block_entity, chest_obstruction, and the OnPlayerDestroyed / OnFallOn / OnPlaced / OnStepOn / OnStepOff trigger descriptions.

BlockEmbeddedVisualDescription: slot 10 is 0x106dfa78, not decompiled (UNKNOWN).

The class to "minecraft:" name mapping comes from RTTI names and was not traced through the factory table.

## Items (ItemRegistryPacket)

The packet payload (name, id, version, component_based, data compound) is cereal-loaded as ItemRegistryPacketPayload (A:0x0c157adc). I did not trace those field names.

The per-item compound reader is A:0x0feabe80 (Ghidra entry is mid-function; the real start is a little earlier) with A:0x0feace90. It walks the compound's keys and compares them with immediates (for example "item_pro"+"operties", "item_tag"+"s"). The server-side writer is A:0x0feab17c.

| Key | NBT type | Handling | Status |
|---|---|---|---|
| item_properties | Compound | legacy property reads below | SEEN |
| item_tags | List of String | each non-empty entry added as a tag | SEEN |
| any other key | Compound | component created by name (0x0fe736e8), then loaded through its virtual +0x30 (0x0fe1d6b0). Logs "Failed to construct component '{}'" or "Failed to validate component '{}'" | SEEN |

### item_properties

All reads are unconditional except block and hover_text_color. A missing key therefore writes the getter default (0, false or empty) over the item field; for example max_stack_size absent gives 0. I did not test this in game.

| Key | NBT type | Stored as | Status |
|---|---|---|---|
| allow_off_hand | Byte bool | | SEEN |
| can_destroy_in_creative | Byte bool | bit 1 at +0x1c9 | SEEN |
| creative_category | Int | truncated to byte | SEEN |
| creative_group | String | | SEEN |
| damage | Int | | SEEN |
| enchantable_value | Int | | SEEN |
| enchantable_slot | String, parsed to enum (0x0fcea5fc) | | SEEN |
| foil | Byte bool | | SEEN |
| frame_count | Int | | SEEN |
| hand_equipped | Byte bool | | SEEN |
| hidden_in_commands | Byte (raw byte reader 0x113036a4) | | SEEN |
| liquid_clipped | Byte bool | | SEEN |
| max_stack_size | Int | truncated to byte | SEEN |
| mining_speed | Float | | SEEN |
| should_despawn | Byte bool | | SEEN |
| stacked_by_data | Byte bool | | SEEN |
| use_animation | Int | truncated to byte | SEEN |
| use_duration | Int | | SEEN |
| block | String, only if present | resolved to a block | SEEN |
| hover_text_color | String, only if present | | SEEN |
| minecraft:icon | Compound | icon component built and loaded through its +0x30 virtual | SEEN |

The writer emits the same set (A:0x0feab17c). item_tags goes next to item_properties, not inside it.

### Item component payloads

NetworkedItemComponent<T> vtables (seen for FuelItemComponent): slot +0x28 is 0x128d5ccc, which looks up the cereal TypeSchema for the component's meta type and calls its save. Slot +0x30 is 0x128d5a24, which dispatches into the cereal load. So item component NBT goes through the same cereal schema as behavior pack JSON (INFERRED from the generic template code; the NBT reader/writer classes were not decompiled). Block components differ: the hand-written NBT readers above use their own keys (for example friction {value}, light_emission {emission}, light_dampening {lightLevel}), which differ from the JSON shape.

Item::initClient (A:0x100827f0) also reads a legacy JSON (mItemJsonData) for description.category and components minecraft:icon, minecraft:icon_variant, minecraft:icon_atlas, minecraft:use_animation, minecraft:hover_text_color, minecraft:rarity. That is a JSON path, not network NBT.

## Coordinator questions

### Experiment gates for neighbor_change, vibration_properties, enchantment_power_transmitter (Windows 1.26.65)

- 0x14328a950, 0x14328aa20 and 0x14328aaf0 are the _Do_call bodies of std::function objects (vtables 0x14f186320, 0x14f186350, 0x14f186380). Each logs "To use '{}', experimental creator features are required" at level 2 for minecraft:enchantment_power_transmitter, minecraft:vibration_properties and minecraft:neighbor_change respectively. SEEN.
- All three are installed only by 0x1431e7a60, a block definition validator. When `*param_2 == 0` (experiment flag off), it looks up each gated name in the definition's component map (+0x1f0) and in every permutation (+0x220..+0x228, stride 0x78, map at +0x30), and runs the callback when the name is present. The same function also gates minecraft:collision_box when a version check against 1.26.60 fails, minecraft:redstone_producer against 1.26.20, minecraft:block_entity, and multi_block trait horizontal directions ("Upcoming Creator Features experiment is required for trait '{}' for horizontal directions", version range check against 1.26.50). SEEN.
- 0x1431e7a60 is referenced only from the block registration routine 0x1431d0c20 ("Vanilla block %s is already registered with a different ID", "Failed to validate block ID for internal block data for block '%s'"). Its only caller is 0x142331ff0, which passes `this->[0x110]`. The network reader thunk 0x142332e40 writes into `this->[0x110]` too, and both methods sit in the same three vtables (0x14f0c6.., 0x14f137.., 0x14f2d1..). SEEN.
- Conclusion: INFERRED yes. Network-received definitions land in the same definition group that the gated registration routine walks. I did not trace that 0x142331ff0 actually runs on the client after StartGamePacket, nor what fills param_2 (experiment byte plus format version at +8) for network definitions, which carry no format_version. If param_2 comes from the world's experiments, the server's experiment toggles decide it. UNKNOWN.
- None of the three components exist in Android 1.26.52.3 (no strings), so there is no Android cross-check.

### vanilla_block_data / block_archetype for non-minecraft namespaces

- Network path: the reader (A:0x1057f480, W:0x1431bd2a0) reads vanilla_block_data, block_id, material and block_archetype with no namespace condition. The "minecraft" namespace check only sets a flag in the parsed definition. SEEN.
- What later stages do with that flag (for example skipping the archetype or block_id for custom namespaces) was not traced. UNKNOWN.
- JSON path: description.internal_vanilla_data appears in the description schema builder A:0x11be6f9c, next to identifier regexes "^\S+$" and "^minecraft:.*$". Which regex applies to which field was not confirmed. UNKNOWN.

## Windows 1.26.65 string presence

Present as exact strings: blocks_to_corner_with, isV1Component, hasPlayerPlacing, hasPlayerInteract, can_occlude_vibrations, can_dampen_vibrations, block_archetype, blockTags, use_liquid_clipping, stopsLiquidFromDirection, shelf_block, wall_foliage_block, item_specific_speeds, triggerType, allowsWireToStepDown, ClientDummyCustomComponent, minecraft:icon_atlas, minecraft:icon_variant. Bare corner_and_cardinal_direction and sixteen_way_rotation exist only as the tail of their "minecraft:"-prefixed strings. No Windows decompile was done for components, traits or items, so those tables are Android-only.
