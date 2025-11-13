import { world, system } from "@minecraft/server";

system.runInterval(() => {
    for (const player of world.getPlayers()){
        //ステップ
        if (player.isOnGround && player.isSneaking){
            player.runCommand("tag @s[scores={Step=1}] add Step");
            player.runCommand("scoreboard players add @s Step 1");
        } else if (!player.isSneaking){
            player.runCommand("scoreboard players set @s Step 0");
        };

        if (player.hasTag("Step")){
            player.runCommand("tag @s remove Step");
            const vel = player.getVelocity();
            player.applyKnockback(vel.x,vel.z,3,0);
        };
    };
});

world.afterEvents.playerSpawn.subscribe(() => {
    if (!world.scoreboard.getObjective('Step')) world.scoreboard.addObjective('Step');
});