from django.http import HttpResponseRedirect
from django.urls import reverse
from django.shortcuts import render
from django import forms



class NewTaskForm(forms.Form):
    task = forms.CharField(label="New Task")
    priority = forms.IntegerField(label="priority", min_value = 1, max_value= 10)


# Create your views here.
def index(request):
    if "tasks" not in request.session:
        request.session["tasks"] = []
    return render(request, "tasks/index.html", {
        "tasks": request.session["tasks"]
    })
    
def add(request):
    # if there was smth submitted 
    if request.method == "POST": 
        # get the form w the data 
        form = NewTaskForm(request.POST)
        # check if its valid
        if form.is_valid():
            # store the task in a new variable
            task = form.cleaned_data["task"]
            # add to the list 
            request.session["tasks"] += [task]
            return HttpResponseRedirect(reverse("tasks:index"))
        else:
            # return their form back
            return render(request, "tasks/add.html", {
                "form": form
            })
    
    return render(request, "tasks/add.html", {
        "form": NewTaskForm()
    })