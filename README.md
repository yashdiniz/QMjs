This code intends to be a display of a hobby that I began working on in the recent months. It is an attempt to:
+ Create an efficient QM-based *boolean function minimizer*.
+ Create an efficient and *tiny representation(preferably canonical) of the boolean function*.
+ (although far fetched and a really inefficient use case) Try compressing a file using this method.

## Quine-McCluskey tabular algorithm

The [Quine-McCluskey Algorithm](https://en.wikipedia.org/wiki/Quine–McCluskey_algorithm) is functionally identical to the Karnaugh maps taught in most Digital Electronics and Boolean Algebra courses. As described in Wikipedia, the QM method for boolean function minimization(or the **QM method** for short) is a tabular method for finding and choosing Prime Implicants(or Prime Cubes) that lead to a minimized boolean expression.

It is however pretty obvious that this algorithm is not feasible for minimising larger functions due to the exponential growth of prime cube search space.

## Gurunath-Biswas proposed algorithm

This paper[1] describes heuristics that can lead to better choices of cubes at earlier stages, thus reducing the amount of iterations required to search for the minimal solution. The paper also describes a data structure that can help optimise the minimisation.

## Code in this repository

This project follows a similar algorithm to that of the paper(although a different data structure), using object oriented and programming languages. The code is now more maintainable, and is also more reusable. 

The `Filecomp.js` proves how modular and reusable the code is, by applying the algorithm to create a boolean representation of a file.

## Bibliography

[1] B. Gurunath and N. N. Biswas, “An algorithm for multiple output minimization,” IEEE Transactions on Computer-Aided Design Vol. 8. No 9. Sep. 1989.