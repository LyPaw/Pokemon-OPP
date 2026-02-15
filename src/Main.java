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


        CreadorPokemons c = new CreadorPokemons();
        c.inicializarPokemons();
        System.out.println(c.toString());
        System.out.println("Ataques de Charmander " + c.AtaquesCharmander());
    }
}