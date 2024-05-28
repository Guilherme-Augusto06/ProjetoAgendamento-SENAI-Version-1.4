# views.py
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as auth_login, logout
from django.contrib.auth.models import User, Group
from django.http import JsonResponse
from .models import Senai, Salas
from .forms import formCadastroUsuario, FormLogin, SalaForm
from django.contrib.auth.decorators import login_required, user_passes_test

def group_required(*group_names):
    """Requires user membership in at least one of the groups passed in."""
    def in_groups(u):
        if u.is_authenticated:
            if bool(u.groups.filter(name__in=group_names)):
                return True
        return False
    return user_passes_test(in_groups)

@login_required
@group_required('Coordenador')
def homepageAdmin(request):
    if not request.user.groups.filter(name='Coordenador').exists():
        return redirect('/')

    if request.method == 'POST':
        if 'delete' in request.POST:
            ids_to_delete = request.POST.getlist('selected_ids')[0].split(',')
            ids_to_delete = [int(id) for id in ids_to_delete]
            Salas.objects.filter(id__in=ids_to_delete).delete()
            return redirect('/homepageAdmin')

        form = SalaForm(request.POST)
        if form.is_valid():
            form.save()
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({"message": "Sala adicionada com sucesso!"})
            return redirect('/homepageAdmin')
        else:
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({"errors": form.errors}, status=400)
    else:
        form = SalaForm()

    context = {
        'dadosSenai': Senai.objects.all(),
        'dadosSalas': Salas.objects.all(),
        'form': form
    }
    return render(request, 'homepageAdmin.html', context)



@login_required
@group_required('Professor')
def homepageProfessor(request):
    context = {}
    dadosSenai = Senai.objects.all()
    dadosSalas = Salas.objects.all()
    context["dadosSenai"] = dadosSenai
    context["dadosSalas"] = dadosSalas
    return render(request, 'homepageProfessor.html', context)

def logout_view(request):
    logout(request)
    return redirect('/')

def homepage(request):
    context = {}
    dadosSenai = Senai.objects.all()
    context["dadosSenai"] = dadosSenai
    return render(request, 'homepage.html', context)

def cadastroUsuario(request):
    context = {}
    dadosSenai = Senai.objects.all()
    context["dadosSenai"] = dadosSenai
    if request.method == 'POST':
        form = formCadastroUsuario(request.POST)
        if form.is_valid():
            var_nome = form.cleaned_data['first_name']
            var_sobrenome = form.cleaned_data['last_name']
            var_usuario = form.cleaned_data['user']
            var_email = form.cleaned_data['email']
            var_senha = form.cleaned_data['password']

            user = User.objects.create_user(username=var_usuario, email=var_email, password=var_senha)
            user.first_name = var_nome
            user.last_name = var_sobrenome
            user.save()
            return redirect('/login')
    else:
        form = formCadastroUsuario()
        context['form'] = form
    return render(request, 'cadastroUsuario.html', context)

def login(request):
    context = {}
    dadosSenai = Senai.objects.all()
    context["dadosSenai"] = dadosSenai
    if request.method == 'POST':
        form = FormLogin(request.POST)
        if form.is_valid():
            var_usuario = form.cleaned_data['user']
            var_senha = form.cleaned_data['password']
            
            user = authenticate(username=var_usuario, password=var_senha)

            if user is not None:
                auth_login(request, user)
                if user.groups.filter(name='Coordenador').exists():
                    return redirect('/homepageAdmin')
                elif user.groups.filter(name='Professor').exists():
                    return redirect('/homepageProfessor')
                else:
                    return redirect('/')
            else:
                print('Login falhou')
    else:
        form = FormLogin()
        context['form'] = form
    return render(request, 'login.html', context)

def faq(request):
    context = {}
    dadosSenai = Senai.objects.all()
    context["dadosSenai"] = dadosSenai
    return render(request, 'faq.html', context)

def faqAdmin(request):
    context = {}
    dadosSenai = Senai.objects.all()
    context["dadosSenai"] = dadosSenai
    return render(request, 'faqAdmin.html', context)

def faqProfessor(request):
    context = {}
    dadosSenai = Senai.objects.all()
    context["dadosSenai"] = dadosSenai
    return render(request, 'faqProfessor.html', context)
 
