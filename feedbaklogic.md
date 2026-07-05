if workload == "push my limits":
    # 🔴 THE HARD STOP
    # You are psychologically or physically at your maximum sustainable limit.
    next_week_volume = current_volume 
    # The app will never add another set, regardless of pump or soreness ratings [1, 2].

else:
    # 🟢 THE ADJUSTMENT ZONE (Workload is "easy" or "pretty good")
    # The system recognizes you have the capacity to handle more work if physiologically necessary.
    
    if soreness == "crippled" or soreness == "not healed on time":
        # ⏪ REVERSE
        # You generated too much muscle damage, forcing resources toward healing rather than growth.
        next_week_volume = current_volume - 1  
        # The algorithm subtracts sets for the next week [3, 4].
        
    elif pump == "good to great" and soreness == "healed just in time":
        # 🟡 THE GOLDILOCKS ZONE
        # You achieved the perfect stimulus-to-fatigue ratio. 
        next_week_volume = current_volume 
        # The algorithm maintains your sets exactly the same because your volume is optimal [5, 6].
        
    elif pump == "barely any or none" and soreness == "none or barely any":
        # 🟢 GREEN LIGHT
        # Your session barely impacted your strength and failed to hit the growth threshold.
        next_week_volume = current_volume + 1  
        # The algorithm adds 1 to 2 sets next week to increase the challenge [7, 8].