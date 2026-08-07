from django.contrib import admin

from .models import Category
from .models import Game
from .models import GamingRoom


admin.site.register(Category)
admin.site.register(Game)
admin.site.register(GamingRoom)


admin.site.site_header = "PS Lounge Administration"

admin.site.site_title = "PS Lounge"

admin.site.index_title = "Welcome to PS Lounge"