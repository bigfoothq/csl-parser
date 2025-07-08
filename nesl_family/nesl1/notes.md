nesl1_2 is best cos doing the same test with nesl1_1 was missing `"` in stuff like in-text pv""" 

NO THIS IS WRONG.  and the implicit MLS thing is just harder for it to use. needs more reminders. 

ok so lets go back to using NESL1_1. require () for MLS

nesl1_1 needs one fewer final "reminder" ... doens't need any reminder about MSL tbh.  makes me feel like the () make it easier for LLM


UPDATE ... playing with nesl1_1 w haiku... its fucking up with internal end-marker string in text ....


wondering if pipe string would be better?  

ok so actually... if u tell a dumb LLM (create some examples where the end-marker is part of the string)... it'll fuck up.  cos that needs like thinking.  but giving it actual examples of text with the end-marker and telling it to format it correctly works great for both gfl and h3.5

https://claude.ai/chat/4d3cad9d-4301-4312-8f7a-87639a059bd5

ok but i want to check one more time that a pipe strignwouldnt be better....

ok so yeah sadly nesl1_3 (`pv|` line start marker) failed to preserve leading whitespace in strings about 30% of the time (in the Violets are blue test)

nesl1_1 it is! 