#include<iostream>

int cfun1(Cls3 arg1, int arg2){
    int c;
    float d;
}
int cfun2(Cls2 arg1, int arg2){
    int h;
}

int fun1(Cls1 arg1, int arg2){
    cfun1();
    cfun2();
}

class Cls1 {
    int a;
    int b;
    int fun2(){
        int* c;
        int* d;
        fun1();
        fun2();
    }
    int fun3(){
        int i;
        int j;
        fun2();
    }
};

class Cls2{
    int c;
    int d;
    int fun3(){
        int* c;
        int* d;
        fun1();
        fun2();
    }
    int fun4(){
        int i;
        int j;
        fun2();
    }
};