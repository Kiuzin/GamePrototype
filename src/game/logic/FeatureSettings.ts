/** Remove literais da configuração para permitir injeção de dados nos testes. */
export type FeatureSettings<T> =
    T extends string ? string :
        T extends number ? number :
            T extends boolean ? boolean :
                T extends readonly (infer Item)[] ? readonly FeatureSettings<Item>[] :
                    T extends object ? { readonly [Key in keyof T]: FeatureSettings<T[Key]> } :
                        T;
