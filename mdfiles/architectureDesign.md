# If the User Labels Multiple Workouts with the Same Weekday (e.g., Two "Monday"s)
What happens in the UI: The weekday dropdown (e9) lists all 7 days (Monday through Sunday). It has no duplicate checks or disabled options. A user can freely set Day 1 to "Monday" and Day 2 to "Monday".

What happens upon saving (iY): There is no validation error. The system does not require weekdays to be unique.
How the app treats them: Workouts are stored and indexed sequentially by position (days[0], days[1], etc.), not by weekday name. In the training tracker:
Day 1 is /weeks/1/days/1 (labeled "Monday").
Day 2 is /weeks/1/days/2 (also labeled "Monday"). They are treated as two distinct, independent workout sessions (for example, a morning session and an evening session).


---
Maintain = MV (Maintenance Volume): ~4 to 8 sets per week total.
Grow = MEV (Minimum Effective Volume): ~8 to 12 sets per week total.
Emphasize = High MEV Ramp: ~12 to 18+ sets per week total.