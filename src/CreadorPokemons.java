import java.util.ArrayList;
import java.util.HashMap;

public class CreadorPokemons {


    /**
     * Generaciones
     */
    private HashMap<Generacion,ArrayList<Pokémon>> pokemonsPorGeneracion = new HashMap<>();
    private ArrayList<Pokémon> gen1 =  new ArrayList<>();
    private ArrayList<Pokémon> gen2 =  new ArrayList<>();
    private ArrayList<Pokémon> gen3 =  new ArrayList<>();

    /**
     * Ataques
     */
    Ataque ascuas = new Ataque("Ascuas",TipoPokemon.FUEGO,80,100);
    Ataque drenadoras = new Ataque("Drenadoras",TipoPokemon.PLANTA,80,100);
    Ataque latigoCepa = new Ataque("Latigo Cepa",TipoPokemon.PLANTA,80,20);
    Ataque burbuja = new Ataque("Burbuja",TipoPokemon.AGUA,40,100);


    /**
     * CreacionPokemon
     */
    Pokémon charmander;
    Pokémon bulbasur;
    Pokémon squirtle;

    public void inicializarPokemons(){


        /**
         * Lo he hecho asi para que sea muy facil meterlos y se puedan reutilizar
         */

        //Gen 1
        charmander =new Pokémon(1,"Charmander",TipoPokemon.FUEGO,TipoPokemon.FUEGO,Generacion.GEN1,1,100,100);
        charmander.aprenderAtaque(ascuas);
        gen1.add(charmander);
        /// //////////
        bulbasur =new Pokémon(2,"Bulbasur",TipoPokemon.PLANTA,TipoPokemon.PLANTA,Generacion.GEN1,1,100,100);
        bulbasur.aprenderAtaque(latigoCepa);
        bulbasur.aprenderAtaque(drenadoras);
        gen1.add(bulbasur);
        /// //////////
        squirtle = new Pokémon(2,"Squirtle",TipoPokemon.AGUA,TipoPokemon.AGUA,Generacion.GEN1,1,100,100);
        squirtle.aprenderAtaque(burbuja);
        gen1.add(squirtle);

        pokemonsPorGeneracion.put(Generacion.GEN1,gen1);
        /// //////////
        //Gen2
    }


    public String AtaquesCharmander(){
        return charmander.mostrarAtaques();
    }
    public String AtaquesBulbasur(){
        return bulbasur.mostrarAtaques();
    }
    public String AtaquesSquirtle(){
        return squirtle.mostrarAtaques();
    }


    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();

        /**
         * Itera las claves el HashMap(Generaciones) y las va imprimiento
         */
        for (Generacion gen : pokemonsPorGeneracion.keySet()) {
            sb.append(gen).append(":\n");

            /**
             * Itera los nombre del HashMap y los imprime
             */
            for (Pokémon p : pokemonsPorGeneracion.get(gen)) {
                sb.append("  - ").append(p).append("\n");
            }
        }

        return sb.toString();
    }



}
