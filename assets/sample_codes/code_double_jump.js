import { world, system } from "@minecraft/server";

function getScore(objectId,target){
    try{
        return world.scoreboard.getObjective(objectId).getScore(target);
    } catch {
        return undefined;
    }
};

system.runInterval(() => {
    if (!world.scoreboard.getObjective('jumpcount')) world.scoreboard.addObjective('jumpcount');
    if (!world.scoreboard.getObjective('jumping')) world.scoreboard.addObjective('jumping');
    for (const player of world.getPlayers()){
        const dir = player.getViewDirection();
        const pos = player.location;

        const forwardPos = {
            x: pos.x + dir.x * 1.5,
            y: pos.y + 1,
            z: pos.z + dir.z * 1.5
        };

        if (!player.isOnGround){ 

            for (let dx = -1; dx <= 1; dx++){
                for (let dy = 0; dy <= 1; dy++){
                    for (let dz = -1; dz <= 1; dz++){
                        const checkPos = {
                            x: Math.floor(forwardPos.x + dx),
                            y: Math.floor(forwardPos.y + dy),
                            z: Math.floor(forwardPos.z + dz)
                        };
                        const block = player.dimension.getBlock(checkPos);
                        if (block && block.typeId !== "minecraft:air"){
                            player.addTag("CanJump");
                            break;
                        }
                        if (player.hasTag("CanJump")) break;
                    }
                    if (player.hasTag("CanJump")) break;
                }
            };
            if (!player.hasTag("CanJump")){player.runCommand(`execute if entity @e[name=!${player.name},r=2] run tag @s add CanJump`)}
            if (!player.isJumping){player.runCommand("scoreboard players set @s jumping 0")}
            if (getScore("jumpcount",player) == 0){system.runTimeout(() => {player.runCommand("scoreboard players set @s jumpcount 1")}),20};
            if (player.isJumping){
                if (player.hasTag("CanJump") && getScore("jumpcount",player) == 1 && getScore("jumping",player) == 0){
                    player.runCommand(`damage @e[name=!${player.name},r=2] 1 entity_attack entity @s`);
                    player.runCommand("playsound armor.equip_leather @a ~~~");

                    //ジャンプアニメーション（自作）
                    player.runCommand("playanimation @s animation.motion.shinobi.jump");
                    
                    player.applyKnockback(0,0,1,0.7);
                    player.runCommand("effect @s jump_boost infinite 10");
                    player.runCommand("inputpermission set @s jump disabled");
                    player.runCommand("scoreboard players add @s jumpcount 1");
                }
            }
        } else if (player.isOnGround){
            if (getScore("jumpcount",player) != 0){player.runCommand("scoreboard players set @s jumpcount 0")};
            if (getScore("jumping",player) != 1){player.runCommand("scoreboard players set @s jumping 1")};
            if (player.hasTag("CanJump")){player.removeTag("CanJump")};
            if (!player.isSneaking){
                if (player.getEffect("jump_boost")){
                    player.removeEffect("jump_boost");
                    system.runTimeout(() => {player.runCommand("inputpermission set @s jump enabled")},10);
                }
            } else if (player.isSneaking){
                if (player.getEffect("jump_boost").amplifier > 4){
                    player.removeEffect("jump_boost");
                }
                player.runCommand("effect @s jump_boost infinite 3");
            }
        };
    };
});