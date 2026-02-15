import java.util.ArrayList;

public class Pokémon {

    int id;
    String nombre;
    TipoPokemon tipoPrincipal;
    TipoPokemon tipoSecundario;
    Generacion generacion;
    int nivel;
    int ps;
    int psMax;
    ArrayList<Ataque> ataques = new ArrayList<>();


    public Pokémon(int id, String nombre, TipoPokemon tipoPrincipal, TipoPokemon tipoSecundario, Generacion generacion, int nivel, int ps, int psMax) {
        this.id = id;
        this.nombre = nombre;
        this.tipoPrincipal = tipoPrincipal;
        this.tipoSecundario = tipoSecundario;
        this.generacion = generacion;
        this.nivel = nivel;
        this.ps = ps;
        this.psMax = psMax;
    }

    public void aprenderAtaque(Ataque ataque) {
        ataques.add(ataque);
    }

    public String getNombre() {
        return nombre;
    }


    @Override
    public String toString() {
        return "|" + nombre;
    }

    public String mostrarAtaques(){
        return ataques.toString();
    }

}
