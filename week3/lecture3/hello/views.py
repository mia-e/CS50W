from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.

def index(request):
    return render(request, "hello/index.html")

def mia(request):
    return HttpResponse("Hello, Mia")

def brian(request):
    return HttpResponse("Hello, Brian!")

def greet(request, name):
    return render(request, "hello/greet.html", {
        "name": name.capitalize()
    })