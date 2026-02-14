import java.io.IOException;
import java.util.ArrayList;
import java.util.Scanner;

public class Main {

    public static void borradoPantalla() {
        try {
            new ProcessBuilder("cmd", "/c", "cls").inheritIO().start().waitFor();
        } catch (IOException | InterruptedException e) {
            System.out.println("No se pudo limpiar la pantalla.");

        }
    }

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);
        int opcion = 0;
        int pokemonIniicial = 0;
        Pokémon pikachu = new Pokémon("Pikachu","Electrico","Impactrueno","Cola Ferrea","Electro Tela","Pika Turbo");
        Pokémon charmander = new Pokémon("Charmander","Fuego","Ascuas","Llamarada","Fuego Fatuo","Lanzallamas");


        ArrayList<Pokémon> primeraGeneracion = new ArrayList<>();
        ArrayList<Pokémon> equipo = new ArrayList<>();
        primeraGeneracion.add(pikachu);
        primeraGeneracion.add(charmander);

        System.out.println(primeraGeneracion.get(0));


        /**
         *
         */





        /**
         * Acciones
         */
        do {

            System.out.println("Selecciona a tu Pokémon inicial\n1.Pokémon Inicial\n2.Charmander");
            opcion = sc.nextInt();

            switch (opcion){

                case 1:
                    System.out.println("Elige tu Pokémon Inicial\n1.Pikachu\n2.Charmander");
                    pokemonIniicial = sc.nextInt();
                    borradoPantalla();
                    switch(pokemonIniicial){
                        case 1:
                            System.out.println("Tu Pokémon es " + primeraGeneracion.get(0));
                            equipo.add(primeraGeneracion.get(0));
                            borradoPantalla();
                            break;
                        case 2:
                            System.out.println("Tu Pokémon es " + primeraGeneracion.get(1));
                            equipo.add(primeraGeneracion.get(1));
                            borradoPantalla();
                            break;


                    }
                    break;

                case 2:

                    break;

            }
        }while(opcion!=0);



    }
}