public class Ataque {
    String nombre;
    TipoPokemon tipo;
    int potencia;
    int precision;
    int pp;
    int ppMax;


    public Ataque(String nombre, TipoPokemon tipo, int potencia, int precision) {
        this.nombre = nombre;
        this.tipo = tipo;
        this.potencia = potencia;
        this.precision = precision;
        this.pp = 0;
        this.ppMax = 0;
    }

    @Override
    public String toString() {
        return "|" + nombre + "|";
    }

}
