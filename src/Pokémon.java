public class Pokémon {

    String nombre;
    String tipo;
    String ataque1;
    String ataque2;
    String ataque3;
    String ataque4;

    public Pokémon(String nombre, String tipo, String ataque1, String ataque2, String ataque3, String ataque4) {
        this.nombre = nombre;
        this.tipo = tipo;
        this.ataque1 = ataque1;
        this.ataque2 = ataque2;
        this.ataque3 = ataque3;
        this.ataque4 = ataque4;
    }

        @Override
            public String toString() {
                return "||Pokémon: " + nombre;

            }

}
